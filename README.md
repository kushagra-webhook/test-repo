# Test Repository for Code Quality Automation

This is a test repository designed to test various code quality checks including:
- Python code analysis
- JavaScript code analysis
- Security vulnerabilities
- Code style and formatting
- Documentation coverage

## Structure

```
test-repo/
├── python/
│   ├── example.py           # Example Python code with good practices
│   ├── security_issues.py   # Python code with intentional security issues
│   ├── complex_code.py      # Complex Python code for testing complexity analysis
│   └── requirements.txt     # Python dependencies
└── javascript/
    ├── example.js           # Example JavaScript code with good practices
    ├── security_issues.js   # JavaScript code with intentional security issues
    └── package.json         # Node.js project configuration
```

## How to Use

1. Push this repository to GitHub
2. Set up a webhook to your local Code Quality Automation server
3. Make changes to test different scenarios

## JavaScript Development Setup

### ESLint Configuration

To set up ESLint for this project, run the following commands in the project root:

```bash
# Initialize npm if not already done
npm init -y

# Install ESLint as a dev dependency
npm i -D eslint

# Initialize ESLint configuration
npx eslint --init
```

### Alternative Global Installation

For a quick setup without modifying the project (not recommended for team projects):

```bash
# Install ESLint globally
npm i -g eslint
```

### Project Structure

The JavaScript code is located in the `javascript/` directory. The ESLint configuration will be created in the project root.
