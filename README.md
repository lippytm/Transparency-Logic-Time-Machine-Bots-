# Transparency-Logic-Time-Machine-Bots-

The Grand United Fields of Theories

[![CI](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/blank.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/blank.yml)
[![Security Scan](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/security.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/security.yml)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)

## Overview

This project includes comprehensive quality and hardening features:

- **Config Validation**: Type-safe configuration with Zod validation
- **Telemetry**: Optional OpenTelemetry integration (no vendor lock-in)
- **Security Scanning**: Trivy vulnerability scanning and SBOM generation
- **Pre-commit Hooks**: Automatic linting and formatting
- **Dependency Management**: Renovate for automated updates

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
npm install @huggingface/transformers    # HuggingFace Transformers
npm install pinecone-client               # Pinecone vector database
npm install weaviate-ts-client            # Weaviate vector database
npm install chromadb                      # Chroma vector database
npm install @anchordotdev/anchor          # Anchor.dev
```

**Why optional?** These packages are large and not needed for basic functionality. Install only what your use case requires.

## Configuration

### Configuration Validation

The project uses Zod for runtime configuration validation. Configuration is loaded from environment variables with type checking and validation.

**Configuration Schema:**

- `APP_NAME`: Application name (default: transparency-logic-time-machine-bots)
- `NODE_ENV` or `APP_ENV`: Environment (development|staging|production)
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (debug|info|warn|error, default: info)
- `TELEMETRY_*`: Optional telemetry settings
- `AI_*`: Optional AI/ML settings
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
