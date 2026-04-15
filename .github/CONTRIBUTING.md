# Contributing to GowVision

Thank you for your interest in contributing to GowVision! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git
- Virtual environment (venv/virtualenv)

### Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gowvision.git
   cd gowvision
   ```

2. **Set up Python backend**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r doc/requirements.txt
   pip install pytest pytest-cov pytest-mock
   ```

3. **Set up Node.js frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Install pre-commit hooks**
   ```bash
   pip install pre-commit
   pre-commit install
   ```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bugfixes
git checkout -b bugfix/your-bugfix-name
```

### Code Style Guidelines

#### Python Code
- Follow PEP 8 style guide
- Use 4 spaces for indentation
- Maximum line length: 100 characters
- Use type hints for function parameters and return values
- Write docstrings for all public functions/classes

```python
def validate_breed_name(breed: str) -> bool:
    """
    Validate cattle breed name format.
    
    Args:
        breed: The breed name to validate
        
    Returns:
        bool: True if valid, False otherwise
        
    Raises:
        ValidationError: If breed name is invalid
    """
    # Implementation
    pass
```

#### TypeScript/React Code
- Follow Airbnb JavaScript style guide
- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use proper TypeScript types (avoid `any`)
- Add JSDoc comments for React components

```typescript
/**
 * Display cattle breed detector component
 * @param {string} title - Component title
 * @returns {JSX.Element} The breed detector component
 */
export const BreedDetection: React.FC<{ title?: string }> = ({ title = 'Breed Detection' }) => {
  // Implementation
}
```

### Testing

#### Backend Tests
```bash
cd backend
pytest tests/ -v
pytest tests/ --cov=. --cov-report=html
```

#### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

**Test Requirements:**
- Write tests for new features
- Maintain minimum 80% code coverage
- All tests must pass before submitting PR
- Include both unit and integration tests

### Running Locally

**Backend:**
```bash
cd backend
python app.py
# Will run on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Will run on http://localhost:5173
```

## Commit Message Guidelines

Use clear, descriptive commit messages following the Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build, dependency, or tooling changes

**Examples:**
```
feat(breed-detection): add support for Sahiwal breed detection
fix(api): correct CORS configuration for frontend origin
docs(api): document government schemes endpoint responses
test(validators): add comprehensive sanitization tests
```

## Pull Request Process

1. **Create a feature branch** from `develop`
2. **Make your changes** and commit regularly
3. **Write/update tests** for your changes
4. **Update documentation** if needed
5. **Push to your fork**
6. **Create a Pull Request** to `develop` branch

### PR Checklist
- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Code coverage maintained/improved
- [ ] Documentation updated
- [ ] Commit messages are clear and descriptive
- [ ] No hardcoded secrets or API keys
- [ ] No console.log/print statements left
- [ ] Changes are backward compatible (if applicable)

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Related Issue
Closes #(issue number)

## Testing
Describe how you tested these changes

## Screenshots (if applicable)
Add screenshots for UI changes
```

## Code Review Guidelines

- Be respectful and constructive
- Ask questions rather than making demands
- Approve changes if they meet quality standards
- Request changes if issues are found
- All conversations must be professional

## Issue Reporting

### Bug Reports
Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, browser, versions)
- Screenshots/logs if applicable

### Feature Requests
Include:
- Clear description of the feature
- Use case/motivation
- Proposed implementation (if applicable)
- Alternative approaches considered

## Documentation

- Keep README.md updated
- Add docstrings to all public code
- Update API documentation for endpoint changes
- Include examples in documentation
- Document environment variables in .env.example

## Security

- Never commit secrets, API keys, or passwords
- Use environment variables for sensitive data
- Report security issues privately to maintainers
- Sanitize user input on both frontend and backend
- Validate all API requests

## Performance Considerations

- Optimize database queries
- Implement caching where appropriate
- Minimize bundle size for frontend
- Use pagination for large datasets
- Debounce/throttle rapid API calls

## Get Help

- Open an issue for questions
- Check existing issues and documentation first
- Join our community discussions
- Contact maintainers if needed

Thank you for contributing! 🙏
