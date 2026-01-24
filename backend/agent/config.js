/**
 * Agent Configuration
 * 
 * LLM-agnostic configuration that supports multiple providers.
 * Set AGENT_PROVIDER env var to switch between: 'openai', 'anthropic', 'ollama'
 */

require('dotenv').config();

const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
  anthropic: {
    name: 'Anthropic',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  ollama: {
    name: 'Ollama (Local)',
    model: process.env.OLLAMA_MODEL || 'llama3.2',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },
};

const activeProvider = process.env.AGENT_PROVIDER || 'openai';

module.exports = {
  provider: activeProvider,
  config: PROVIDERS[activeProvider],
  allProviders: PROVIDERS,
  
  // Agent behavior settings
  settings: {
    maxTokens: parseInt(process.env.AGENT_MAX_TOKENS || '2048', 10),
    temperature: parseFloat(process.env.AGENT_TEMPERATURE || '0.7'),
    maxRetries: parseInt(process.env.AGENT_MAX_RETRIES || '3', 10),
    timeoutMs: parseInt(process.env.AGENT_TIMEOUT_MS || '30000', 10),
  },
  
  // Internal API base URL (the Express backend)
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api',
};
