# Transparency-Logic-Time-Machine-Bots-
The Grand United Fields of Theories

## AI/Web3 Integration Bundle

This repository provides a comprehensive integration bundle for AI, Web3, messaging, and data services. Built primarily with Node.js/TypeScript, with adapter notes for Python, Go, and Rust.

## Features

- **AI Integration**: OpenAI, Hugging Face, LangChain, LlamaIndex, vector stores (Pinecone, Weaviate, Chroma)
- **Web3 Support**: EVM chains (ethers.js), Solana (@solana/web3.js, Anchor), extensible for other chains
- **Messaging**: Slack SDK, Discord SDK
- **Data Services**: PostgreSQL, Redis, AWS S3, IPFS
- **Container Deployment**: GitHub Actions workflow for container builds to ghcr.io
- **Multi-language Support**: TypeScript/Node.js primary, with Python/Go/Rust adapter notes

## Installation

```bash
npm install
```

### Optional Heavy Dependencies

Some AI and vector store dependencies are marked as optional to reduce installation size:

```bash
# Install with all optional dependencies
npm install --include=optional

# Install specific optional dependencies
npm install @huggingface/transformers @pinecone-database/pinecone
```

### Linux Compatibility

All dependencies are Linux-compatible. For optimal performance:
- Node.js 18+ recommended
- Python 3.8+ for Python adapters
- Go 1.20+ for Go adapters
- Rust 1.70+ for Rust adapters

## Quick Start

```typescript
import { SDK } from './sdk';

// Create all adapters from environment variables
const sdk = SDK.createFromEnv();

// Access individual adapters
const ai = sdk.ai;
const web3 = sdk.web3;
const messaging = sdk.messaging;
const data = sdk.data;
```

## Adapters & Providers

### AI Adapter (`sdk/ai/adapter.ts`)

Integrates with [@lippytm/ai-sdk](https://github.com/lippytm/ai-sdk) for AI services.

**Providers:**
- OpenAI (GPT-4, GPT-3.5, embeddings)
- Hugging Face (transformers, inference API) - *optional*
- LangChain (chains, agents, tools)
- LlamaIndex (query engines, indices)
- Vector Stores:
  - Pinecone - *optional*
  - Weaviate - *optional*
  - Chroma - *optional*

**Required Environment Variables:**
```bash
OPENAI_API_KEY=sk-...                    # OpenAI API key
OPENAI_MODEL=gpt-4                       # Optional: model selection
HF_API_TOKEN=hf_...                      # Hugging Face API token (optional)
HF_MODEL=model-name                      # Hugging Face model (optional)
LANGCHAIN_ENABLED=true                   # Enable LangChain (optional)
VECTOR_STORE_PROVIDER=pinecone           # Vector store: pinecone|weaviate|chroma
VECTOR_STORE_API_KEY=...                 # Vector store API key
VECTOR_STORE_ENVIRONMENT=...             # Vector store environment
VECTOR_STORE_URL=...                     # Vector store URL
```

### Web3 Adapter (`sdk/web3/adapter.ts`)

Multi-chain blockchain integration.

**Providers:**
- EVM chains via ethers.js (Ethereum, Polygon, BSC, Arbitrum, Optimism, etc.)
- Solana via @solana/web3.js
- Anchor framework support (optional)
- Extension points for other chains

**Required Environment Variables:**
```bash
ETH_RPC_URL=https://...                  # Ethereum/EVM RPC endpoint
ETH_PRIVATE_KEY=0x...                    # Ethereum private key (use secret manager!)
ETH_CHAIN_ID=1                           # Chain ID (optional)
SOLANA_RPC_URL=https://...               # Solana RPC endpoint
SOLANA_PRIVATE_KEY=...                   # Solana private key (use secret manager!)
SOLANA_COMMITMENT=confirmed              # Solana commitment level (optional)
```

### Messaging Adapter (`sdk/messaging/adapter.ts`)

Multi-platform messaging integration.

**Providers:**
- Slack via @slack/web-api
- Discord via discord.js

**Required Environment Variables:**
```bash
SLACK_BOT_TOKEN=xoxb-...                 # Slack bot token
SLACK_SIGNING_SECRET=...                 # Slack signing secret (optional)
DISCORD_BOT_TOKEN=...                    # Discord bot token
```

### Data Adapter (`sdk/data/adapter.ts`)

Multi-source data integration.

**Providers:**
- PostgreSQL via pg
- Redis
- AWS S3
- IPFS

**Required Environment Variables:**
```bash
DATABASE_URL=postgresql://...            # PostgreSQL connection string
REDIS_URL=redis://...                    # Redis connection string
AWS_ACCESS_KEY_ID=...                    # AWS access key
AWS_SECRET_ACCESS_KEY=...                # AWS secret key
AWS_REGION=us-east-1                     # AWS region
S3_BUCKET=bucket-name                    # S3 bucket name (optional)
IPFS_URL=http://localhost:5001           # IPFS node URL
```

## Multi-Language Support

### Python Adapters

See [sdk/PYTHON_ADAPTERS.md](sdk/PYTHON_ADAPTERS.md) for Python implementation examples using:
- `openai`, `transformers`, `langchain`, `llama-index`
- `web3.py`, `solana-py`
- `slack-sdk`, `discord.py`
- `psycopg2`, `redis-py`, `boto3`, `ipfshttpclient`

### Go Adapters

See [sdk/GO_ADAPTERS.md](sdk/GO_ADAPTERS.md) for Go implementation examples using:
- `go-openai`, `langchaingo`
- `go-ethereum`, `solana-go`
- `slack-go`, `discordgo`
- `pgx`, `go-redis`, `aws-sdk-go-v2`, `go-ipfs-api`

### Rust Adapters

See [sdk/RUST_ADAPTERS.md](sdk/RUST_ADAPTERS.md) for Rust implementation examples using:
- `async-openai`, `llm-chain`
- `ethers`, `solana-sdk`, `anchor-client`
- `slack-morphism`, `serenity`
- `tokio-postgres`, `redis`, `rusoto_s3`, `ipfs-api-backend-hyper`

## Container Deployment

The repository includes a GitHub Actions workflow for building and pushing container images to GitHub Container Registry (ghcr.io).

**Workflow:** `.github/workflows/container-deploy.yml`

**Triggers:**
- Push to `master` or `main` branches
- Manual workflow dispatch

**Environments:**
- `dev`: Development environment
- `stage`: Staging environment
- `prod`: Production environment

**Image Tags:**
- Branch-based: `ghcr.io/lippytm/transparency-logic-time-machine-bots-:master`
- Environment + SHA: `ghcr.io/lippytm/transparency-logic-time-machine-bots-:dev-abc1234`
- Environment latest: `ghcr.io/lippytm/transparency-logic-time-machine-bots-:dev-latest`

**Note:** Container push is currently disabled in the workflow. Enable `push: true` in the workflow when ready to deploy.

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Docker Build

```bash
docker build -t transparency-logic-bots:dev --build-arg ENVIRONMENT=dev .
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit secrets** to the repository
2. **Use environment variables** for all sensitive data
3. **Use secret managers** in production (AWS Secrets Manager, HashiCorp Vault, etc.)
4. **Rotate keys regularly**
5. **Use least-privilege principles** for API keys and service accounts
6. **Enable MFA** where supported

The adapter `fromEnv()` methods are placeholders. In production, integrate with a proper secret management system.

## Contributing

This is an additive integration bundle. When adding new features:
- Keep changes minimal and non-breaking
- Add optional dependencies when appropriate
- Update documentation
- Ensure tests pass

## License

MIT 
