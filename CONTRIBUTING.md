# Contributing to Transparency Logic Time Machine Bots

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository** to your own GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Transparency-Logic-Time-Machine-Bots-.git
   cd Transparency-Logic-Time-Machine-Bots-
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in [Issues](https://github.com/lippytm/Transparency-Logic-Time-Machine-Bots-/issues)
- If not, create a new issue using the issue template
- Provide as much detail as possible: steps to reproduce, expected behavior, actual behavior, environment details

### Suggesting Features

- Check if the feature has already been suggested
- Create a new issue describing the feature and its benefits
- Be open to discussion and feedback

### Contributing Code

1. Pick an issue to work on or create a new one
2. Comment on the issue to let others know you're working on it
3. Follow the development workflow below
4. Submit a pull request when ready

## Development Workflow

### Setting Up Your Development Environment

#### For Node.js/TypeScript projects:

```bash
# Install dependencies
npm install
# or
yarn install

# Run linter
npm run lint
# or
yarn lint

# Run tests
npm test
# or
yarn test
```

#### For Python projects:

```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # If it exists

# Run linter
flake8 .
black --check .

# Run tests
pytest
```

### Making Changes

1. **Keep changes focused**: Each PR should address a single concern
2. **Write tests**: Add tests for new features or bug fixes
3. **Update documentation**: Update README, docstrings, or comments as needed
4. **Follow coding standards**: See section below

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] All tests pass locally
- [ ] New tests added for new features/bug fixes
- [ ] Documentation updated if needed
- [ ] Commits follow the commit message guidelines
- [ ] Branch is up to date with master/main
- [ ] No merge conflicts
- [ ] Self-review completed

### PR Checklist

When you submit a PR, please ensure:

- [ ] **Title** is descriptive and follows conventional commit format (e.g., "feat: add new feature", "fix: resolve bug")
- [ ] **Description** clearly explains the changes and links to related issues
- [ ] **Tests** pass in CI/CD pipeline
- [ ] **No secrets or credentials** are committed
- [ ] **Code review** has been requested from maintainers
- [ ] **Documentation** is updated if the PR changes behavior

### Branch Protection

The `master` and `main` branches are protected with the following rules:

- Pull requests are required before merging
- At least one approval is required
- Status checks must pass:
  - Lint and Test workflow
  - CodeQL Analysis
  - Dependency Review (for PRs)
- Branches must be up to date before merging

## Testing Guidelines

### Writing Tests

- **Unit tests**: Test individual functions/methods in isolation
- **Integration tests**: Test interactions between components
- **Test coverage**: Aim for meaningful test coverage, especially for critical paths

### Running Tests

```bash
# Node.js/TypeScript
npm test
yarn test

# Python
pytest
pytest --cov  # With coverage

# Specific test file
pytest tests/test_specific.py
```

### Test Requirements

- All new features must include tests
- Bug fixes should include a regression test
- Tests should be deterministic and not flaky
- Tests should be fast and focused

## Coding Standards

### General Guidelines

- Write clear, readable, and maintainable code
- Follow the principle of least surprise
- Keep functions/methods small and focused
- Use meaningful variable and function names
- Add comments for complex logic, but prefer self-documenting code

### JavaScript/TypeScript

- Follow the existing code style in the project
- Use ESLint and Prettier for formatting
- Use TypeScript types where applicable
- Prefer `const` over `let`, avoid `var`

### Python

- Follow PEP 8 style guide
- Use type hints for function signatures
- Use Black for code formatting
- Use Flake8 for linting
- Maximum line length: 127 characters

### Documentation

- Add JSDoc/docstrings for public APIs
- Update README for user-facing changes
- Include inline comments for complex algorithms
- Keep documentation up to date with code changes

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, etc.
- `ci`: CI/CD configuration changes

### Examples

```
feat: add user authentication module

Implements JWT-based authentication with refresh tokens.
Includes login, logout, and token refresh endpoints.

Closes #123
```

```
fix: resolve memory leak in event handler

Remove event listeners when component unmounts to prevent memory leaks.

Fixes #456
```

## Questions?

If you have questions about contributing, please:

1. Check existing documentation and issues
2. Ask in a new issue or discussion
3. Contact the maintainers: @lippytm

## Recognition

Contributors will be recognized in the project. Thank you for your contributions! 🎉
