/**
 * Agent Orchestrator
 * 
 * Main entry point for the job search copilot agent.
 * Uses LangChain with tool calling for structured interactions.
 */

const { ChatOpenAI } = require('@langchain/openai');
const { ChatAnthropic } = require('@langchain/anthropic');
const { ChatOllama } = require('@langchain/ollama');
const { HumanMessage, AIMessage, SystemMessage } = require('@langchain/core/messages');
const { ToolNode } = require('@langchain/langgraph/prebuilt');
const { StateGraph, MessagesAnnotation, END } = require('@langchain/langgraph');

const config = require('./config');
const { allTools } = require('./tools');
const { getSystemPrompt } = require('./prompts');

/**
 * Create the LLM instance based on configured provider
 */
function createLLM() {
  const { provider, config: providerConfig, settings } = config;
  
  const commonOptions = {
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
  };
  
  switch (provider) {
    case 'anthropic':
      if (!providerConfig.apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required');
      }
      return new ChatAnthropic({
        apiKey: providerConfig.apiKey,
        model: providerConfig.model,
        ...commonOptions,
      });
      
    case 'ollama':
      return new ChatOllama({
        baseUrl: providerConfig.baseUrl,
        model: providerConfig.model,
        ...commonOptions,
      });
      
    case 'openai':
    default:
      if (!providerConfig.apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      return new ChatOpenAI({
        apiKey: providerConfig.apiKey,
        model: providerConfig.model,
        configuration: {
          baseURL: providerConfig.baseUrl,
        },
        ...commonOptions,
      });
  }
}

/**
 * Create the agent graph using LangGraph
 */
function createAgentGraph() {
  const llm = createLLM();
  const llmWithTools = llm.bindTools(allTools);
  
  // Define the function that calls the model
  async function callModel(state) {
    const response = await llmWithTools.invoke(state.messages);
    return { messages: [response] };
  }
  
  // Define the function that determines whether to continue or end
  function shouldContinue(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    
    // If the LLM makes a tool call, route to the "tools" node
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return 'tools';
    }
    // Otherwise, end the conversation
    return END;
  }
  
  // Create the tool node
  const toolNode = new ToolNode(allTools);
  
  // Build the graph
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue, ['tools', END])
    .addEdge('tools', 'agent');
  
  return workflow.compile();
}

// Singleton graph instance
let agentGraph = null;

/**
 * Get or create the agent graph
 */
function getAgentGraph() {
  if (!agentGraph) {
    agentGraph = createAgentGraph();
  }
  return agentGraph;
}

/**
 * Process a chat message through the agent
 * 
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {Object} context - Additional context (pipeline summary, etc.)
 * @returns {Promise<{response: string, history: Array}>}
 */
async function chat(userMessage, conversationHistory = [], context = {}) {
  try {
    const graph = getAgentGraph();
    
    // Build messages array
    const messages = [
      new SystemMessage(getSystemPrompt(context)),
      ...conversationHistory.map(msg => 
        msg.role === 'user' 
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      ),
      new HumanMessage(userMessage),
    ];
    
    // Invoke the graph
    const result = await graph.invoke(
      { messages },
      { recursionLimit: 15 }
    );
    
    // Extract the final response
    const lastMessage = result.messages[result.messages.length - 1];
    const responseText = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : lastMessage.content.map(c => c.text || '').join('');
    
    // Build updated history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: responseText },
    ];
    
    return {
      response: responseText,
      history: updatedHistory,
    };
  } catch (error) {
    console.error('Agent error:', error);
    throw new Error(`Agent processing failed: ${error.message}`);
  }
}

/**
 * Parse unstructured text (job posting, LinkedIn message) into structured data
 * This is a utility function that can be used before confirmation
 * 
 * @param {string} text - The text to parse
 * @param {string} type - 'job' or 'contact'
 * @returns {Promise<Object>}
 */
async function parseText(text, type = 'job') {
  try {
    const llm = createLLM();
    const { getParsingPrompt } = require('./prompts');
    
    const response = await llm.invoke([
      new SystemMessage('You are a text extraction assistant. Extract structured data from text and return valid JSON only.'),
      new HumanMessage(getParsingPrompt(text, type)),
    ]);
    
    const content = typeof response.content === 'string' 
      ? response.content 
      : response.content.map(c => c.text || '').join('');
    
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Could not extract structured data from text');
  } catch (error) {
    console.error('Parse error:', error);
    throw new Error(`Failed to parse text: ${error.message}`);
  }
}

/**
 * Get current provider info
 */
function getProviderInfo() {
  return {
    provider: config.provider,
    model: config.config.model,
    name: config.config.name,
  };
}

module.exports = {
  chat,
  parseText,
  getProviderInfo,
  createLLM,
  getAgentGraph,
};
