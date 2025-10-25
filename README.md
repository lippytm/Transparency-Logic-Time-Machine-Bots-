# Transparency-Logic-Time-Machine-Bots-
The Grand United Fields of Theories 

## Connected Repositories

This repository is part of a network of interconnected projects:

### 🌐 [Web3AI](https://github.com/lippytm/Web3AI)
Web3 and AI integration platform

### 📝 [gatsby-starter-blog](https://github.com/lippytm/gatsby-starter-blog)
Blog platform built with Gatsby

### ⚙️ [Time-Machines-Builders-](https://github.com/lippytm/Time-Machines-Builders-)
AI automation in Earn while you Learn to Become a Better Programmer and Blockchain Developer

### 🤖 [AI-Time-Machines](https://github.com/lippytm/AI-Time-Machines)
Adding AI Agents to everything with Time Machines

## Workflow Features

This repository includes GitHub Actions workflows that:

- ✅ Run continuous integration on push and pull requests
- ✅ Support manual workflow dispatch with repository selection
- ✅ Monitor status of connected repositories
- ✅ Enable cross-repository synchronization
- ✅ Accept repository dispatch events from other repos

### Workflow Badges

![CI Status](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/workflows/CI/badge.svg)
![Cross-Repository Sync](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/workflows/Cross-Repository%20Sync/badge.svg)

## Usage

### Triggering Workflows Manually

You can trigger workflows manually from the Actions tab:

1. Go to the **Actions** tab
2. Select the workflow you want to run
3. Click **Run workflow**
4. Select options as needed

### Cross-Repository Integration

To enable full cross-repository dispatch capabilities:

1. Create a Personal Access Token (PAT) with `repo` scope
2. Add it as a secret named `REPO_ACCESS_TOKEN` in repository settings
3. Uncomment the repository dispatch step in `cross-repo-sync.yml`

This will allow workflows in this repository to trigger workflows in connected repositories.

