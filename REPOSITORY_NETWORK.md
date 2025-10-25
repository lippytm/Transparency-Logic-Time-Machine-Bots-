# Repository Network Documentation

## Overview

This document describes the network of connected repositories and how they interact through GitHub Actions workflows.

## Repository Network

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     Transparency-Logic-Time-Machine-Bots- (Central Hub)    │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
        ▼            ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
   │Web3AI  │  │ gatsby- │  │ Time-   │  │   AI-    │
   │        │  │ starter-│  │ Machines│  │   Time-  │
   │        │  │  blog   │  │ Builder │  │ Machines │
   └────────┘  └─────────┘  └─────────┘  └──────────┘
```

## Connected Repositories

### 1. 🌐 Web3AI
- **URL:** https://github.com/lippytm/Web3AI
- **Purpose:** Web3 and AI integration platform
- **Language:** Not specified
- **Stars:** 2
- **Default Branch:** main

### 2. 📝 gatsby-starter-blog
- **URL:** https://github.com/lippytm/gatsby-starter-blog
- **Purpose:** Blog platform built with Gatsby
- **Language:** JavaScript
- **Stars:** 1
- **Default Branch:** master

### 3. ⚙️ Time-Machines-Builders-
- **URL:** https://github.com/lippytm/Time-Machines-Builders-
- **Purpose:** AI automation in Earn while you Learn to Become a Better Programmer and Blockchain Developer
- **Language:** Not specified
- **Stars:** 1
- **Default Branch:** main

### 4. 🤖 AI-Time-Machines
- **URL:** https://github.com/lippytm/AI-Time-Machines
- **Purpose:** Adding AI Agents to everything with Time Machines
- **Language:** JavaScript
- **Stars:** 1
- **Default Branch:** main

## Workflow Capabilities

### CI Workflow (blank.yml)

**Triggers:**
- Push to master branch
- Pull requests to master branch
- Manual workflow dispatch (with repository selection)
- Repository dispatch events from other repos

**Jobs:**
1. **build** - Main build job with repository status display
2. **check-connected-repos** - Matrix job that checks all connected repositories

**Features:**
- Lists all connected repositories on each run
- Can be triggered manually with target repository selection
- Can receive triggers from other repositories via repository_dispatch

### Cross-Repository Sync Workflow (cross-repo-sync.yml)

**Triggers:**
- Push to master branch
- Manual workflow dispatch (with notify_all option)

**Jobs:**
1. **notify-connected-repos** - Notifies all connected repositories (when enabled)
2. **display-repo-connections** - Displays visual network map

**Features:**
- Visual display of repository network
- Prepared for cross-repository notifications (requires PAT token)
- Matrix-based notification to all connected repos

## Setup Instructions

### Basic Usage

The workflows are ready to use immediately with the following capabilities:
- Automatic CI runs on push/PR
- Manual workflow triggers
- Repository status monitoring
- Visual network display

### Advanced Setup (Cross-Repository Notifications)

To enable actual cross-repository dispatch capabilities:

1. **Create Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Copy the token

2. **Add Secret to Repository:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `REPO_ACCESS_TOKEN`
   - Value: Paste your PAT token
   - Click "Add secret"

3. **Enable Repository Dispatch:**
   - Edit `.github/workflows/cross-repo-sync.yml`
   - Uncomment lines 37-43 (the Repository Dispatch step)
   - Commit and push the changes

4. **Set Up Receiving Repositories:**
   Each connected repository should add a workflow to receive events:
   ```yaml
   name: Handle Remote Trigger
   on:
     repository_dispatch:
       types: [transparency-bots-update]
   
   jobs:
     handle-update:
       runs-on: ubuntu-latest
       steps:
         - name: Log update
           run: |
             echo "Triggered by: ${{ github.event.client_payload.ref }}"
             echo "From commit: ${{ github.event.client_payload.sha }}"
   ```

## Manual Workflow Execution

### Running CI Workflow Manually

1. Go to: https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions
2. Click on "CI" workflow
3. Click "Run workflow" button
4. Select a target repository (optional)
5. Click "Run workflow"

### Running Cross-Repository Sync

1. Go to: https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions
2. Click on "Cross-Repository Sync" workflow
3. Click "Run workflow" button
4. Check "Notify all connected repositories" if desired
5. Click "Run workflow"

## Workflow Badges

Add these badges to any documentation to show workflow status:

```markdown
![CI Status](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/workflows/CI/badge.svg)
![Cross-Repository Sync](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/workflows/Cross-Repository%20Sync/badge.svg)
```

## Monitoring

### View Workflow Runs

- **All workflows:** https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions
- **CI only:** https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/blank.yml
- **Cross-Repo Sync only:** https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/actions/workflows/cross-repo-sync.yml

### Check Repository Status

Each workflow run displays the status of all connected repositories in the job output.

## Future Enhancements

Potential improvements for the workflow system:

1. **Automated Dependency Updates:** Track and update dependencies across all repositories
2. **Cross-Repository Testing:** Run tests across repository boundaries
3. **Unified Deployment:** Deploy all repositories together
4. **Health Checks:** Regular automated health checks for all repositories
5. **Metrics Dashboard:** Aggregate metrics from all repositories
6. **Security Scanning:** Unified security scanning across the network

## Troubleshooting

### Workflow Not Triggering

- Check that the workflow file is in the default branch (master)
- Verify YAML syntax is correct
- Check Actions tab for any errors

### Repository Dispatch Not Working

- Ensure PAT token has correct scopes
- Verify secret is named exactly `REPO_ACCESS_TOKEN`
- Check that receiving repository has a matching workflow

### Matrix Jobs Failing

- Individual repository checks are informational only
- Failures in matrix jobs won't fail the overall workflow

## Support

For issues or questions:
- Open an issue in this repository
- Check workflow run logs in the Actions tab
- Review GitHub Actions documentation: https://docs.github.com/en/actions
