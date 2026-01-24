# Transparency-Logic-Time-Machine-Bots-

The Grand United Fields of Theories

[![CI](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/blank.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/blank.yml)
[![Security Scan](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/security.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/security.yml)
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
- **Vector Databases**: Pinecone, Weaviate, and ChromaDB support
- **Type-Safe Configuration**: Zod validation for all AI settings
- **Modular Design**: Install only the AI tools you need

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
- **Google AI**: Gemini models (peer dependency for ChromaDB - install separately if needed)
- **HuggingFace**: Open-source transformers and models

**Configuration:**

```bash
# Multi-provider API keys
OPENAI_API_KEY=your-openai-api-key
COHERE_API_KEY=your-cohere-api-key
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
