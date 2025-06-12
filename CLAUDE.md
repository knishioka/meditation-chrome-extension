# Claude Development Guidelines

## Project Overview
This is a meditation Chrome extension that provides guided meditation sessions with background music and voice guidance in English and Japanese.

## Development Rules

### Code Style
- Use ES6+ JavaScript with modern syntax
- Follow Airbnb JavaScript Style Guide
- Use async/await over callbacks
- Maintain consistent indentation (2 spaces)
- Use meaningful variable and function names
- No console.log in production code

### File Structure
- Keep components modular and single-purpose
- Use kebab-case for file names
- Use PascalCase for class names
- Use camelCase for function and variable names

### Chrome Extension Specific
- Always use Manifest V3 patterns
- Use service workers for background tasks
- Implement proper error handling for all API calls
- Follow Chrome Web Store policies

## Linting Configuration
```bash
# Install ESLint and Prettier
npm install --save-dev eslint prettier eslint-config-airbnb-base eslint-plugin-import

# Run linting
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### ESLint Rules
- Enforce semicolons
- Prefer const over let
- No unused variables
- Consistent return statements
- Maximum line length: 100 characters

## Testing Strategy

### Unit Tests
- Use Jest for unit testing
- Test all utility functions
- Mock Chrome APIs for testing
- Maintain >80% code coverage

### Integration Tests
- Test API integrations separately
- Mock external API responses
- Test audio playback functionality

### Manual Testing
- Test on Chrome stable, beta, and canary
- Verify all audio formats work
- Test offline functionality
- Validate both English and Japanese content

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Development Workflow

### Before Starting Development
1. Read the development plan: `docs/DEVELOPMENT_PLAN.md`
2. Check current TODOs and pick a task
3. Create a feature branch
4. Update the development plan as needed

### During Development
1. Write tests first (TDD approach)
2. Implement feature
3. Run linting and tests
4. Update documentation if needed

### Before Committing
1. Run `npm run lint` and fix any issues
2. Run `npm test` and ensure all tests pass
3. Update DEVELOPMENT_PLAN.md if completing tasks
4. Write clear commit messages

## API Keys and Secrets
- Never commit API keys to the repository
- Use environment variables for local development
- Store production keys in Chrome extension's secure storage
- Document required API keys in `.env.example`

## Performance Guidelines
- Minimize bundle size (use tree shaking)
- Lazy load audio resources
- Cache frequently used assets
- Optimize images and icons
- Monitor memory usage in offscreen documents

## Accessibility
- Provide keyboard navigation
- Include ARIA labels
- Support screen readers
- Offer visual alternatives for audio cues

## Localization
- Use Chrome's i18n API
- Keep all strings in `_locales/` directory
- Support both `en` and `ja` locales
- Test both languages thoroughly

## Security
- Validate all user inputs
- Sanitize data before storage
- Use HTTPS for all external requests
- Follow Content Security Policy best practices
- Regular dependency updates

## Documentation
- Update docs when adding new features
- Keep API documentation current
- Document any workarounds or hacks
- Maintain clear README

## Version Control
- Use semantic versioning
- Tag releases properly
- Keep CHANGELOG.md updated
- Create GitHub releases

## Important Notes
- The development plan in `docs/DEVELOPMENT_PLAN.md` should be continuously updated as tasks are completed or new requirements emerge
- Always refer to the latest version of the development plan before starting new work
- Document any deviations from the original plan with justification