# Transparency-Logic-Time-Machine-Bots-

The Grand United Fields of Theories

[![CI](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/blank.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/blank.yml)
[![Security Scan](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/security.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/security.yml)
[![Integration Checks](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/integrations.yml/badge.svg)](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/integrations.yml)
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
- `DATABASE_URL`: PostgreSQL connection string (optional, required for API keys and webhooks)
- `API_KEY_PREFIX`: API key prefix (optional, default: tltm)
- `API_KEY_PEPPER`: API key pepper for additional security (optional)
- `WEBHOOK_MAX_ATTEMPTS`: Maximum webhook delivery attempts (optional, default: 3)
- `WEBHOOK_BACKOFF_BASE_MS`: Webhook retry backoff base in milliseconds (optional, default: 1000)
- `WEBHOOK_TIMEOUT_MS`: Webhook delivery timeout in milliseconds (optional, default: 5000)
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

## API Key Management

### Overview

The application includes a comprehensive API key management system with secure storage and authentication:

- **Secure Storage**: API keys are hashed using Argon2 before storage
- **Bearer Token Authentication**: Standard HTTP Bearer token authentication
- **Scope-based Authorization**: Fine-grained access control using scopes
- **Audit Logging**: All key operations are logged for security auditing
- **Idempotency**: Support for idempotent operations using Idempotency-Key header

### Database Setup

Before using API keys and webhooks, you need to set up the PostgreSQL database:

```bash
# Set DATABASE_URL in your .env file
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Run the database migration
psql $DATABASE_URL < migrations/001_initial_schema.sql
```

### API Endpoints

#### Create API Key

```bash
POST /api/keys
Content-Type: application/json
Idempotency-Key: <optional-unique-key>

{
  "name": "My API Key",
  "owner": "user@example.com",
  "scopes": ["read", "write"],
  "prefix": "tltm",  // optional, defaults to tltm
  "pepper": "secret"  // optional, for additional security
}

Response:
{
  "id": "uuid",
  "name": "My API Key",
  "owner": "user@example.com",
  "scopes": ["read", "write"],
  "prefix": "tltm",
  "token": "tltm_...",  // Only returned once!
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Important**: The full token is only returned once during creation. Store it securely! If using an Idempotency-Key, the same response (including the token) will be returned for duplicate requests with that key within 24 hours.

#### List API Keys

```bash
GET /api/keys
Authorization: Bearer <your-api-key>

Response:
[
  {
    "id": "uuid",
    "name": "My API Key",
    "owner": "user@example.com",
    "scopes": ["read", "write"],
    "prefix": "tltm",
    "last_used_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Revoke API Key

```bash
DELETE /api/keys/:id
Authorization: Bearer <your-api-key>
Idempotency-Key: <optional-unique-key>

Response:
{
  "message": "API key revoked successfully"
}
```

## Webhook Management

### Overview

The webhook system enables real-time event notifications:

- **Event-based Subscriptions**: Subscribe to specific event types
- **HMAC Signature Verification**: Secure webhook deliveries with SHA-256 signatures
- **Automatic Retries**: Configurable retry logic with exponential backoff
- **Delivery Tracking**: Track delivery status and response metrics
- **Replay Failed Deliveries**: Manually retry failed webhook deliveries

### API Endpoints

#### Create Webhook

```bash
POST /api/webhooks
Authorization: Bearer <your-api-key>
Content-Type: application/json

{
  "url": "https://example.com/webhook",
  "events": ["user.created", "user.updated"],
  "secret": "optional-webhook-secret",  // auto-generated if not provided
  "active": true  // optional, defaults to true
}

Response:
{
  "id": "uuid",
  "owner": "user@example.com",
  "url": "https://example.com/webhook",
  "events": ["user.created", "user.updated"],
  "secret": "webhook-secret",
  "active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### List Webhooks

```bash
GET /api/webhooks
Authorization: Bearer <your-api-key>

Response:
[
  {
    "id": "uuid",
    "owner": "user@example.com",
    "url": "https://example.com/webhook",
    "events": ["user.created", "user.updated"],
    "active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Delete Webhook

```bash
DELETE /api/webhooks/:id
Authorization: Bearer <your-api-key>

Response:
{
  "message": "Webhook deleted successfully"
}
```

#### Test Webhook

```bash
POST /api/webhooks/test
Authorization: Bearer <your-api-key>

Response:
{
  "message": "Test delivery sent to 2 webhook(s)",
  "deliveries": [
    {
      "id": "uuid",
      "webhook_id": "uuid",
      "status": "success",
      "attempts": 1
    }
  ]
}
```

#### Replay Failed Delivery

```bash
POST /api/webhooks/:id/replay?delivery_id=<delivery-uuid>
Authorization: Bearer <your-api-key>

Response:
{
  "message": "Delivery replayed",
  "delivery": {
    "id": "uuid",
    "webhook_id": "uuid",
    "event_type": "user.created",
    "status": "success",
    "attempts": 1
  }
}
```

### Webhook Signature Verification

All webhook deliveries include an `X-Signature` header with HMAC SHA-256 signature:

```javascript
// Verify webhook signature in your webhook handler
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = `sha256=${hmac.digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

// In your webhook endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'your-webhook-secret';

  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook event
  res.status(200).json({ received: true });
});
```

### Webhook Headers

Each webhook delivery includes the following headers:

- `Content-Type`: application/json
- `X-Signature`: sha256=<hmac-signature>
- `X-Delivery-ID`: <delivery-uuid>
- `X-Event-Type`: <event-type>

## Health Check

The application includes a health check endpoint:

```bash
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
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
   export MANYCHAT_API_KEY=your-key-here
   # ... etc
   ```

3. **For GitHub Actions**: Add secrets in Repository Settings → Secrets and variables → Actions

**Available Secrets:**

- `OPENAI_API_KEY` - OpenAI API key
- `MANYCHAT_API_KEY` - ManyChat API key
- `BOTBUILDERS_API_KEY` - BotBuilders API key
- `MOLTBOOK_API_KEY` - Moltbook API key
- `MOLTBOT_API_KEY` - Moltbot API key
- `OPENCLAW_API_KEY` - OpenClaw API key
- `GITHUB_PAT` - GitHub Personal Access Token (for extended API access)
- `WEBHOOK_URL` - Generic webhook endpoint URL
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
- Placeholder connectivity checks for: OpenAI, ManyChat, BotBuilders, Moltbook, Moltbot, OpenClaw, GitHub, Webhooks
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
