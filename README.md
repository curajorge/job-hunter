# Job Hunter

Job Hunter is a self-hosted, open-source Customer Relationship Management (CRM) system designed specifically for the modern job search. It treats the job hunt as a sales pipeline, combining Kanban-style application tracking, professional networking management, and targeted resume versioning into a single unified workflow.

Unlike generic spreadsheets or Notion templates, Job Hunter features an embedded AI Copilot (powered by LangChain) that integrates directly with your data to parse job descriptions, track outreach staleness, and draft communications.

## Features

### Pipeline Command Center
*   **Kanban Workflow:** Visual board to manage opportunities across stages (Wishlist, Applied, Interviewing, Offer).
*   **Actionable Insights:** Dashboard widgets highlight immediate action items, such as interview prep or follow-ups.
*   **Goal Tracking:** Daily outreach meters to maintain momentum.

### Professional Network CRM
*   **Contact Buckets:** Organizes connections into strategic tiers (Recruiters, Hiring Managers, Former Colleagues) to ensure balanced networking.
*   **Staleness Algorithms:** Automatically flags contacts you haven't spoken to in defined periods (e.g., 14 days), preventing relationships from going cold.
*   **Engagement History:** Detailed logging of multi-turn conversations across LinkedIn, Email, and other channels.

### Resume Studio
*   **Version Control:** Create and manage multiple versions of your resume tailored to specific roles.
*   **Job Linking:** Associate specific resume versions with job applications to track exactly which document secured an interview.
*   **JSON-Based Editing:** Structured data entry ensures formatting consistency across all versions.

### AI Copilot
*   **Local or Cloud LLMs:** Supports OpenAI, Anthropic, and Ollama via standard API keys.
*   **Context Aware:** The agent has read/write access to your database. It can answer questions like "Who should I follow up with today?" or "Add this job description to my wishlist."
*   **Intelligent Parsing:** Paste unstructured job postings or LinkedIn messages, and the agent will extract structured data (Salary, Role, Company, Requirements) into your database.

## Technical Architecture

*   **Frontend:** React 18, Vite, Material UI (MUI), Framer Motion.
*   **Backend:** Node.js, Express.
*   **Database:** Native SQLite (using the modern `node:sqlite` module).
*   **AI Orchestration:** LangChain, LangGraph.

## Prerequisites

*   **Node.js v22.5.0 or higher**: This project uses the native SQLite module (`node:sqlite`) which requires a recent Node.js version and the `--experimental-sqlite` flag (handled automatically in scripts).

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/job-hunter.git
cd job-hunter
```

### 2. Backend Setup
Navigate to the backend directory to configure the server and database.

```bash
cd backend
npm install
```

**Environment Configuration:**
Create a `.env` file in the `backend` directory based on the example.

```bash
cp .env.example .env
```

Edit the `.env` file to select your AI provider. By default, it is configured for OpenAI.

```ini
# Example .env configuration
AGENT_PROVIDER=openai
OPENAI_API_KEY=sk-...

# For Local LLM (Ollama)
# AGENT_PROVIDER=ollama
# OLLAMA_BASE_URL=http://localhost:11434
```

**Database Initialization:**
Run the migration and seed scripts to set up the SQLite database with initial schema and sample data.

```bash
npm run migrate
npm run seed
```

### 3. Frontend Setup
Return to the root directory (or remain in the backend terminal and open a new one) to install frontend dependencies.

```bash
cd ..
npm install
```

## Running the Application

You can run both the backend and frontend concurrently from the root directory.

```bash
# From the project root
npm run dev
```

*   **Frontend:** http://localhost:5173
*   **Backend API:** http://localhost:3001

## AI Agent Configuration

The AI Agent is located in `backend/agent`. It uses LangGraph to manage conversation state and tool execution.

### Supported Providers
*   OpenAI
*   Anthropic
*   Ollama

To switch providers, update `AGENT_PROVIDER` in `backend/.env` and restart the backend server.

## Project Structure

```text
job-hunter/
├── backend/
│   ├── agent/         # AI Agent logic, tools, and prompts
│   ├── scripts/       # Database migration and seeding scripts
│   ├── sql/           # SQL schema definitions
│   ├── server.js      # Express API entry point
│   └── database.js    # SQLite connection setup
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Main application views (Dashboard, Jobs, etc.)
│   ├── store/         # React Context for state management
│   └── App.jsx        # Frontend entry point
└── README.md
```

## Contributing

Contributions are welcome. Please ensure that any changes to the database schema are accompanied by a corresponding update in `backend/sql/schema.sql`. 

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.
