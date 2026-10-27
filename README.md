# Transparency-Logic-Time-Machine-Bots-

The Grand United Fields of Theories

[![CI](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/blank.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/blank.yml)
[![Security Scan](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/security.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/security.yml)
[![Integration Checks](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/integrations.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/integrations.yml)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)

## Overview

This project includes comprehensive quality, hardening features, and a full AI Stack:

- **Config Validation**: Type-safe configuration with Zod validation
- **Telemetry**: Optional OpenTelemetry integration (no vendor lock-in)
- **Security Scanning**: Trivy vulnerability scanning and SBOM generation
- **Pre-commit Hooks**: Automatic linting and formatting
- **Dependency Management**: Renovate for automated updates
- **AI Stack**: Comprehensive AI tools and toolkits with Claude, LangChain, and multi-provider support

## Installation

### Base Installation

Install core dependencies only:

```bash
npm install
```

### Optional Heavy Dependencies

Heavy AI/ML and vector database dependencies are optional. Install only what you need:

```bash
# Install all optional dependencies
npm install --include=optional

# Or install specific optional dependencies:
npm install @anthropic-ai/sdk              # Anthropic Claude AI SDK
npm install langchain @langchain/anthropic # LangChain with Claude integration
npm install openai                         # OpenAI SDK
npm install cohere-ai                      # Cohere AI SDK
npm install ai                             # Vercel AI SDK
npm install @huggingface/transformers      # HuggingFace Transformers
npm install pinecone-client                # Pinecone vector database
npm install weaviate-ts-client             # Weaviate vector database
npm install chromadb                       # Chroma vector database
npm install @google/generative-ai          # Google AI SDK (peer dependency for ChromaDB)
npm install @anchordotdev/anchor           # Anchor.dev
```

**Why optional?** These packages are large and not needed for basic functionality. Install only what your use case requires.

## AI Stack

### Full AI Toolkit with Claude

This project includes a comprehensive AI Stack with support for multiple AI providers and toolkits. The stack is designed to be modular and flexible, allowing you to use only the components you need.

**Key Features:**

- **Claude AI Integration**: Full support for Anthropic's Claude models (Opus, Sonnet, Haiku)
- **LangChain Integration**: Build complex AI applications with LangChain and Claude
- **Multi-Provider Support**: OpenAI, Cohere, Google AI, and more
- **AI Clone Services**: Hermes, Fabric Engines, Swarms Systems, and AI Copilot integrations
- **MemPalace Memory**: Opt-in local MCP setup for persistent Jarvis assistant memory
- **Vector Databases**: Pinecone, Weaviate, and ChromaDB support
- **Type-Safe Configuration**: Zod validation for all AI settings
- **Modular Design**: Install only the AI tools you need

### MemPalace for Jarvis assistants and swarms

[MemPalace](https://github.com/MemPalace/mempalace) is a separate Python
application that stores and searches project files and conversations locally.
Use it as a memory layer for your AI-building-AI workflows, not as a replacement
for platform APIs, assistant accounts, or workflow orchestration.

**Included here:** an opt-in `mempalace` service entry in
`config/services.example.json` and an MCP client template in
`config/mempalace.mcp.example.json`. The Node application does not launch
MemPalace, ingest accounts, or automatically connect any external service.
The integration-check workflow does not test this local MCP server.

#### Local setup

Install Python 3.10+ and [uv](https://docs.astral.sh/uv/), then install the
official package in its own environment:

```bash
uv tool install 'mempalace==3.12.0'
mempalace --help
mempalace init /absolute/path/to/your/project
```

Merge `config/mempalace.mcp.example.json` into your MCP client's server
configuration; do not overwrite other configured servers. The template runs
`mempalace-mcp` over local stdio, with no API key or public endpoint. If the client
cannot find that executable, replace `command` with its absolute installed path.
Restart the client and confirm that it lists the MemPalace tools. Only configure
clients you trust: MCP tools can read and modify the memory available to them.
See the [upstream setup guide](https://mempalaceofficial.com/guide/getting-started.html)
for client-specific configuration and storage settings.

For a safe first check, mine a small directory containing only approved,
non-sensitive text, then search for a known phrase:

```bash
mempalace mine /absolute/path/to/approved-memory-imports
mempalace search "a known phrase from the approved files"
mempalace wake-up
```

Verify recall in the MCP client as well. Initial embedding-model downloads need
network access and disk space. Keep the palace and imports outside the checkout
where possible; `.mempalace/`, `mempalace-data/`, and `memory-imports/` are ignored
as a defense against accidental commits, not a substitute for access control.
Changing `enabled` in a local `config/services.json` records intent only; it does
not register the MCP server.

#### Platform connection boundaries

These are connection options, **not bundled or verified platform connectors**.
Feature availability depends on the product, account plan, and administrator.
ChatGPT/ChatGPT Business subscriptions do not themselves supply API access.

| Platform                          | Connection option and requirement                                                                                                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hostinger.com                     | Run MemPalace on a VPS with Python and persistent private storage; shared website hosting may not support it. Use local stdio on that host or an explicitly secured upstream remote deployment. |
| GitHub                            | Mine an approved local checkout or exported issue/PR notes. A GitHub API adapter needs separately scoped credentials; do not import repository secrets.                                         |
| ChatGPT / ChatGPT Business        | Import approved conversation exports; use an administrator-approved connector only if the workspace supports the required MCP transport. The stdio template is not a hosted ChatGPT connector.  |
| Gemini AI                         | Use a compatible MCP client such as Gemini CLI, or approved exports. This does not automatically connect the Gemini web application.                                                            |
| Claude / Claude coworker (Cowork) | Use the client's documented MCP configuration where supported, or approved exports. Claude Code/desktop and Cowork have different permissions and setup requirements.                           |
| Perplexity                        | Import approved exports or use a separately implemented, authorized API workflow; no native connection is configured here.                                                                      |
| YouTube                           | Import transcripts or metadata you are authorized to use; automated retrieval needs an appropriate API adapter and permissions.                                                                 |
| Facebook / Instagram / Threads    | Use authorized exports or approved Meta APIs with required scopes and app review; no account scraping or automatic publishing.                                                                  |
| LinkedIn                          | Use authorized exports or approved API access; access to an account does not imply API permission.                                                                                              |
| Substack                          | Import your own authorized exports or permitted feed content; no subscriber-data ingestion is configured.                                                                                       |
| Slack                             | Use an approved app/export with channel-scoped access and workspace authorization.                                                                                                              |
| Zapier                            | Use an explicit adapter between authorized Zap events and MemPalace; Zapier webhooks cannot call a local stdio server directly.                                                                 |
| Zoom                              | Import authorized meeting transcripts with participant consent and required account permissions.                                                                                                |

#### Jarvis memory workflow and safeguards

1. Collect only approved source material in a private staging directory. Preserve
   source platform, source URL/ID, timestamp, project, and access classification
   alongside each record.
2. Organize memory by project and assistant role using MemPalace wings and rooms.
   Use separate palaces or runtime identities for different trust boundaries;
   organizational labels alone are not access-control enforcement.
3. Have assistants search relevant memory before planning or answering, and
   verify retrieved facts against their sources. Treat imported content as
   untrusted data, never as instructions to execute tools.
4. Save approved decisions and handoff notes for the next assistant. Require
   human approval before publishing, messaging, changing infrastructure, or
   delegating actions that expose private content.
5. Define retention, deletion, and encrypted-backup procedures before importing
   business conversations. Never ingest credentials, `.env` files, or private
   client data without authorization. Do not mine the entire checkout blindly.

Local storage does not prevent an assistant from sending retrieved text to its
model provider. Review provider/workspace data policies before retrieval.
For Hostinger or multi-host swarms, do not expose the local memory store or an
unauthenticated bridge to the internet; use upstream-supported authenticated
deployment, TLS, least-privilege access, and persistent storage. This repository
does not provision that deployment or its platform adapters.

### Claude AI Configuration

Claude is Anthropic's family of state-of-the-art AI models. This project supports all Claude models with full configuration options.

**Available Models:**

- `claude-3-opus-20240229` - Most capable model for complex tasks
- `claude-3-sonnet-20240229` - Balanced performance and speed
- `claude-3-haiku-20240307` - Fastest model for simple tasks

**Configuration:**

```bash
# Enable Claude AI
CLAUDE_ENABLED=true
CLAUDE_API_KEY=your-anthropic-api-key
CLAUDE_MODEL=claude-3-opus-20240229
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=1.0
```

**Usage Example:**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { loadConfig } from './config';

const config = loadConfig();

if (config.claude?.enabled && config.claude.apiKey) {
  const anthropic = new Anthropic({
    apiKey: config.claude.apiKey,
  });

  const message = await anthropic.messages.create({
    model: config.claude.model,
    max_tokens: config.claude.maxTokens,
    temperature: config.claude.temperature,
    messages: [
      {
        role: 'user',
        content: 'Hello, Claude!',
      },
    ],
  });

  console.log(message.content);
}
```

### LangChain Integration

LangChain is a framework for developing applications powered by language models. This project includes LangChain with Claude integration.

**Configuration:**

```bash
# Enable LangChain
LANGCHAIN_ENABLED=true
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langchain-api-key
LANGCHAIN_PROJECT=your-project-name
```

**Usage Example:**

```typescript
import { ChatAnthropic } from '@langchain/anthropic';
import { loadConfig } from './config';

const config = loadConfig();

if (config.langchain?.enabled && config.claude?.apiKey) {
  const model = new ChatAnthropic({
    anthropicApiKey: config.claude.apiKey,
    modelName: config.claude.model,
    temperature: config.claude.temperature,
  });

  const response = await model.invoke([
    {
      role: 'user',
      content: 'What is LangChain?',
    },
  ]);

  console.log(response.content);
}
```

### Multi-Provider AI Support

The AI Stack supports multiple AI providers for flexibility and fallback options.

**Supported Providers:**

- **Anthropic Claude**: State-of-the-art conversational AI
- **OpenAI**: GPT-4, GPT-3.5, and embeddings
- **Cohere**: Generate, embed, and classify text
- **Hermes**: AI clone orchestration
- **Fabric Engines**: AI workflow runtime
- **Swarms Systems**: Multi-agent coordination
- **AI Copilot**: Assistant-style AI clone support
- **Google AI**: Gemini models (peer dependency for ChromaDB - install separately if needed)
- **HuggingFace**: Open-source transformers and models

**Configuration:**

```bash
# Multi-provider API keys
OPENAI_API_KEY=your-openai-api-key
COHERE_API_KEY=your-cohere-api-key
HERMES_API_KEY=your-hermes-api-key
FABRIC_ENGINES_API_KEY=your-fabric-engines-api-key
SWARMS_SYSTEMS_API_KEY=your-swarms-systems-api-key
AI_COPILOT_API_KEY=your-ai-copilot-api-key
# Note: For Google AI, install @google/generative-ai separately (peer dependency for ChromaDB)
# GOOGLE_API_KEY=your-google-api-key
```

### Vector Databases

Vector databases are essential for AI applications that require semantic search and retrieval.

**Supported Vector Databases:**

- **Pinecone**: Managed vector database with high performance
- **Weaviate**: Open-source vector search engine
- **ChromaDB**: AI-native embedding database

**Configuration:**

```bash
VECTOR_DB_ENABLED=true
VECTOR_DB_TYPE=pinecone
VECTOR_DB_API_KEY=your-api-key
VECTOR_DB_ENDPOINT=https://your-instance.vectordb.com
```

### AI Stack Installation

Install the complete AI Stack or individual components:

```bash
# Complete AI Stack
npm install --include=optional

# Claude AI only
npm install @anthropic-ai/sdk

# LangChain with Claude
npm install langchain @langchain/anthropic

# Vector databases
npm install pinecone-client weaviate-ts-client chromadb

# Multi-provider support
npm install openai cohere-ai
```

## Configuration

### Configuration Validation

The project uses Zod for runtime configuration validation. Configuration is loaded from environment variables with type checking and validation.

**Configuration Schema:**

- `APP_NAME`: Application name (default: transparency-logic-time-machine-bots)
- `NODE_ENV` or `APP_ENV`: Environment (development|staging|production)
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (debug|info|warn|error, default: info)
- `TELEMETRY_*`: Optional telemetry settings
- `AI_*`: Optional AI/ML settings (HuggingFace)
- `CLAUDE_*`: Optional Claude AI settings (Anthropic)
- `LANGCHAIN_*`: Optional LangChain settings
- `OPENAI_API_KEY`: Optional OpenAI API key
- `COHERE_API_KEY`: Optional Cohere API key
- `VECTOR_DB_*`: Optional vector database settings

**Example:**

```bash
# Copy example environment file
cp .env.example .env

# Edit configuration
nano .env
```

**Validate Configuration:**

```bash
# Build the project first
npm run build

# Run config validation smoke test
npm run validate:config
```

The validation performs no network calls - only local parsing and validation.

## Telemetry

### OpenTelemetry Integration

Optional OpenTelemetry integration with no vendor lock-in. Uses standard OpenTelemetry APIs compatible with any OTLP-compatible backend (Jaeger, Zipkin, Datadog, New Relic, etc.).

**Enable Telemetry:**

```bash
# Set in .env file
TELEMETRY_ENABLED=true
TELEMETRY_SERVICE_NAME=my-service
TELEMETRY_ENDPOINT=http://localhost:4318  # Optional - OTLP endpoint
TELEMETRY_SAMPLE_RATE=0.1                 # Sample 10% of traces
```

**Features:**

- Automatic instrumentation via OpenTelemetry auto-instrumentations
- Distributed tracing with standard OpenTelemetry APIs
- Structured logging with context
- No vendor lock-in - use any OTLP-compatible backend

**Usage:**

```typescript
import { getTracer, createLogger } from './telemetry';

const logger = createLogger('my-module');
const tracer = getTracer('my-module');

logger.info('Processing request', { userId: '123' });

const span = tracer.startSpan('my-operation');
// ... your code ...
span.end();
```

## Development

### Building

```bash
npm run build
```

### Linting and Formatting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Pre-commit Hooks

Pre-commit hooks are automatically installed via husky. They will:

1. Run lint-staged to format and lint changed files
2. Run config validation smoke test (if built)

**Manual setup (if needed):**

```bash
# Install husky hooks
npm run prepare
```

### Testing

```bash
npm test
```

## Security

### Vulnerability Scanning

The project uses Trivy for security scanning. Scans run automatically on:

- Every push to master/main
- Every pull request
- Weekly schedule (Monday 00:00 UTC)
- Manual workflow dispatch

**View Security Results:**

- GitHub Security tab → Code scanning alerts
- Workflow runs → Security Scan workflow

**Run Locally:**

```bash
# Install Trivy (macOS)
brew install aquasecurity/trivy/trivy

# Run scan
trivy fs .
```

### SBOM Generation

Software Bill of Materials (SBOM) is generated using Syft in both SPDX and CycloneDX formats.

**Download SBOM:**

1. Go to Actions → Security Scan workflow
2. Click on a workflow run
3. Download "sbom-files" artifact

**Generate Locally:**

```bash
# Install Syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Generate SBOM
syft packages . -o spdx-json=sbom.spdx.json -o cyclonedx-json=sbom.cyclonedx.json
```

## Dependency Management

### Renovate

This project uses [Renovate](https://docs.renovatebot.com/) for automated dependency updates.

**Configuration:**

- **Schedule**: Updates run before 5am on Monday (UTC)
- **Heavy Dependencies**: AI/ML packages update monthly to reduce churn
- **Auto-merge**: Patch updates for dev dependencies
- **Grouping**: Related packages updated together
- **Security Alerts**: Enabled with "security" label

**Renovate Dashboard:**
Check Issues tab for the Renovate Dependency Dashboard

**Configuration File:** `renovate.json`

## Service Integrations

### Full Stack Toolkit

This project includes a standardized integration framework for cross-platform services.

**Supported Services:**

- **OpenAI** - AI/ML capabilities
- **Hermes** - AI clone orchestration
- **Fabric Engines** - AI workflow runtime
- **Swarms Systems** - Multi-agent coordination
- **AI Copilot** - AI assistant integration
- **ManyChat** - Chatbot automation
- **BotBuilders** - Bot development platform
- **Moltbook** - Service integration
- **Moltbot** - Service integration
- **OpenClaw** - Service integration
- **GitHub API** - Extended GitHub operations
- **Webhooks** - Generic webhook notifications

**Configuration:**

1. Copy the example configuration:

   ```bash
   cp config/services.example.json config/services.json
   ```

2. Set environment variables or GitHub secrets for the services you want to use:

   ```bash
   export OPENAI_API_KEY=your-key-here
   export HERMES_API_KEY=your-key-here
   export FABRIC_ENGINES_API_KEY=your-key-here
   export SWARMS_SYSTEMS_API_KEY=your-key-here
   export AI_COPILOT_API_KEY=your-key-here
   export MANYCHAT_API_KEY=your-key-here
   # ... etc
   ```

3. **For GitHub Actions**: Add secrets in Repository Settings → Secrets and variables → Actions

**Available Secrets:**

- `OPENAI_API_KEY` - OpenAI API key
- `HERMES_API_KEY` - Hermes API key
- `FABRIC_ENGINES_API_KEY` - Fabric Engines API key
- `SWARMS_SYSTEMS_API_KEY` - Swarms Systems API key
- `AI_COPILOT_API_KEY` - AI Copilot API key
- `MANYCHAT_API_KEY` - ManyChat API key
- `BOTBUILDERS_API_KEY` - BotBuilders API key
- `MOLTBOOK_API_KEY` - Moltbook API key
- `MOLTBOT_API_KEY` - Moltbot API key
- `OPENCLAW_API_KEY` - OpenClaw API key
- `GITHUB_PAT` - GitHub Personal Access Token (for extended API access)
- `WEBHOOK_URL` - Generic webhook endpoint URL
- `SERVICE_BASE_URL_HERMES` - Custom Hermes base URL (optional)
- `SERVICE_BASE_URL_FABRIC_ENGINES` - Custom Fabric Engines base URL (optional)
- `SERVICE_BASE_URL_SWARMS_SYSTEMS` - Custom Swarms Systems base URL (optional)
- `SERVICE_BASE_URL_AI_COPILOT` - Custom AI Copilot base URL (optional)
- `SERVICE_BASE_URL_OPENCLAW` - Custom OpenClaw base URL (optional)
- `SERVICE_BASE_URL_*` - Custom base URLs for other services (optional)

**Security:**

⚠️ **NEVER commit `config/services.json` with real secrets** - it's already in `.gitignore`

✓ Always use environment variables or GitHub secrets for credentials

✓ See `config/services.example.json` for detailed documentation and best practices

## CI/CD

### Workflows

**CI Workflow** (`.github/workflows/blank.yml`):

- Linting and formatting checks
- TypeScript compilation
- Config validation smoke tests
- Tests

**Security Workflow** (`.github/workflows/security.yml`):

- Trivy vulnerability scanning
- SBOM generation with Syft
- Results uploaded to GitHub Security tab

**Integration Checks Workflow** (`.github/workflows/integrations.yml`):

- Manual trigger via `workflow_dispatch`
- Automatic trigger on push to `main`
- Detects presence of service API keys (never prints secret values)
- Placeholder connectivity checks for: OpenAI, Hermes, Fabric Engines, Swarms Systems, AI Copilot, ManyChat, BotBuilders, Moltbook, Moltbot, OpenClaw, GitHub, Webhooks
- Dry-run oriented (safe for all environments)
- No external dependencies (pure bash/curl)

## Project Structure

```
.
├── src/
│   ├── config/          # Configuration validation module
│   │   ├── index.ts     # Config schema and loader
│   │   └── validator.ts # Smoke test script
│   ├── telemetry/       # OpenTelemetry integration
│   │   └── index.ts     # Tracer and logger setup
│   └── index.ts         # Main entry point
├── .github/
│   └── workflows/       # GitHub Actions workflows
├── .husky/              # Git hooks
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── renovate.json        # Renovate configuration
└── .env.example         # Example environment variables
```

## License

MIT
