# Contributing to Solana PancakeSwap Pool Fetcher CLI

Thank you for your interest in contributing to the Solana PancakeSwap Pool Fetcher CLI! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

We welcome contributions from the community! Here are the main ways you can contribute:

- 🐛 **Bug Reports**: Report bugs and issues
- 💡 **Feature Requests**: Suggest new features
- 🔧 **Code Contributions**: Submit pull requests
- 📚 **Documentation**: Improve docs and examples
- 🧪 **Testing**: Help with testing and validation

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git
- A Solana RPC endpoint for testing

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/solana-pancake-swap.git
   cd solana-pancake-swap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your development environment**
   ```bash
   # Run in development mode
   npm run dev
   
   # Build the project
   npm run build
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Use strict TypeScript with proper typing
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: Use descriptive variable and function names
- **Comments**: Add JSDoc comments for public methods
- **Error Handling**: Implement proper error handling and logging

### File Structure

```
src/
├── types.ts          # TypeScript interfaces
├── constants.ts      # Configuration constants
├── utils.ts          # Utility functions
├── storage.ts        # File I/O operations
├── pancake-fetcher.ts # Core business logic
└── cli.ts           # Command-line interface
```

### Testing Guidelines

- Test with multiple RPC endpoints
- Verify error handling scenarios
- Test with different pool types
- Validate output file formats
- Test rate limiting and batch processing

### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(cli): add support for CSV export
fix(fetcher): handle Token-2022 accounts properly
docs(readme): update installation instructions
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Node.js version
   - Operating system
   - Package version

2. **Steps to Reproduce**
   - Clear, step-by-step instructions
   - Command used
   - RPC endpoint (without API keys)

3. **Expected vs Actual Behavior**
   - What you expected to happen
   - What actually happened

4. **Additional Context**
   - Error messages
   - Screenshots (if applicable)
   - Logs

**Bug Report Template:**
```markdown
## Bug Description
Brief description of the issue

## Environment
- Node.js: v18.0.0
- OS: Ubuntu 20.04
- Package: solana-pancake-swap@1.0.0

## Steps to Reproduce
1. Run command: `solana-pancake-swap 50 --rpc https://your-rpc.com`
2. Observe error: [error message]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happened]

## Additional Information
[Any other relevant details]
```

## 💡 Feature Requests

When suggesting features, please include:

1. **Feature Description**
   - Clear explanation of the feature
   - Use cases and benefits

2. **Implementation Ideas**
   - How it could be implemented
   - Any technical considerations

3. **Priority**
   - High/Medium/Low priority
   - Justification for priority level

**Feature Request Template:**
```markdown
## Feature Description
[Clear description of the feature]

## Use Cases
- [Use case 1]
- [Use case 2]

## Proposed Implementation
[How it could be implemented]

## Priority
[High/Medium/Low] - [Justification]

## Additional Notes
[Any other relevant information]
```

## 🔧 Pull Request Process

### Before Submitting

1. **Ensure your code follows guidelines**
   - Run `npm run build` to check for TypeScript errors
   - Test your changes thoroughly
   - Update documentation if needed

2. **Test your changes**
   ```bash
   # Test with different commands
   npm run dev -- 50 --rpc https://your-rpc.com
   npm run dev -- inactive --rpc https://your-rpc.com
   npm run dev -- no-volume --rpc https://your-rpc.com
   ```

3. **Update documentation**
   - Update README.md if adding new features
   - Update CHANGELOG.md with your changes
   - Add JSDoc comments for new functions

### Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why (not how)
3. **Related Issues**: Link to any related issues
4. **Testing**: Describe how you tested the changes
5. **Breaking Changes**: Note any breaking changes

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Tested with multiple RPC endpoints
- [ ] Verified error handling
- [ ] Checked output file formats
- [ ] Tested rate limiting

## Breaking Changes
- [ ] Yes (describe changes)
- [ ] No

## Related Issues
Closes #[issue number]
```

## 📚 Documentation

When contributing to documentation:

- Use clear, concise language
- Include code examples
- Keep examples up-to-date
- Use proper markdown formatting
- Add emojis for visual appeal

## 🧪 Testing

### Manual Testing Checklist

- [ ] Test with different RPC endpoints
- [ ] Verify all commands work correctly
- [ ] Check error handling scenarios
- [ ] Validate JSON output format
- [ ] Test rate limiting behavior
- [ ] Verify help system works
- [ ] Test short alias (`spswap`)

### Testing Commands

```bash
# Test basic functionality
npm run dev -- --help
npm run dev -- 10 --rpc https://your-rpc.com

# Test specific features
npm run dev -- inactive --rpc https://your-rpc.com
npm run dev -- no-volume --rpc https://your-rpc.com

# Test short alias
npm run dev -- spswap --help
npm run dev -- spswap 5 --rpc https://your-rpc.com
```

## 🏷️ Release Process

### Version Bumping

We follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features (backward compatible)
- **Major** (2.0.0): Breaking changes

### Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Test all functionality
- [ ] Update documentation if needed
- [ ] Create git tag
- [ ] Publish to npm

## 🎯 Areas for Contribution

### High Priority
- Performance optimizations
- Additional RPC endpoint support
- Enhanced error handling
- More comprehensive testing

### Medium Priority
- Additional export formats (CSV, Excel)
- Real-time monitoring features
- Web dashboard
- Historical data analysis

### Low Priority
- Additional DEX protocol support
- Pool health scoring
- Advanced filtering options
- Integration with other tools

## 📞 Getting Help

If you need help with contributing:

1. **Check existing issues** for similar problems
2. **Read the documentation** thoroughly
3. **Ask questions** in GitHub issues
4. **Join discussions** in pull requests

## 🙏 Recognition

Contributors will be recognized in:

- GitHub contributors list
- README.md acknowledgments
- Release notes
- CHANGELOG.md

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to the Solana DeFi ecosystem! 🚀**
