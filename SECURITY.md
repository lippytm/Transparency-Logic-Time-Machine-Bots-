# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| < latest| :x:                |

## Reporting a Vulnerability

We take the security of our project seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Open a Public Issue

Please do not open a public GitHub issue for security vulnerabilities. This could put users at risk.

### 2. Report the Vulnerability

Please report security vulnerabilities by emailing the maintainer at:

**Contact**: @lippytm via GitHub or open a private security advisory at:
https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/security/advisories/new

### 3. What to Include

Please include the following information in your report:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes (optional)

### 4. Response Timeline (SLA Placeholder)

We aim to respond to security reports with the following timeline:

- **Initial Response**: Within 48 hours of report submission
- **Status Update**: Within 5 business days
- **Fix Timeline**: Depends on severity
  - **Critical**: 7 days
  - **High**: 14 days
  - **Medium**: 30 days
  - **Low**: 90 days

These are target timelines and may vary based on the complexity of the issue.

### 5. Disclosure Policy

- We will work with you to understand and resolve the issue promptly
- We will keep you informed about our progress
- We ask that you do not publicly disclose the vulnerability until we have released a fix
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### Branch Protection

This repository assumes the following branch protection rules are enabled on `master` and `main` branches:

- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators in restrictions
- Require signed commits (recommended)

### Secrets Management

- Never commit secrets, API keys, or credentials to the repository
- Use GitHub Secrets for sensitive data in workflows
- Use environment-specific variables when possible
- Rotate secrets regularly

### Dependencies

- Dependencies are scanned automatically via Dependency Review workflow
- CodeQL analysis runs on all pull requests and weekly
- Update dependencies regularly to patch known vulnerabilities

### Permissions

All GitHub Actions workflows use least-privilege permissions. Workflows only request the permissions they need to function.

## Security Features

This repository includes the following security features:

- **CodeQL Analysis**: Automated code scanning for vulnerabilities
- **Dependency Review**: Review dependencies in pull requests for known vulnerabilities
- **Dependabot**: (Configure in repository settings for automatic dependency updates)

## Contact

For any security-related questions or concerns, please contact @lippytm.
