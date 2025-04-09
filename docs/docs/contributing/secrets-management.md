---
sidebar_position: 5
---

# Secrets Management

OpenCloud Mobile implements strict protocols for managing sensitive information such as API keys, tokens, passwords, and other credentials. This document outlines the practices and tools we use to ensure that secrets are handled securely throughout the development process.

## General Principles

1. **No Secrets in Source Code**: Never hardcode secrets directly in source code
2. **No Secrets in Git**: Prevent committing secrets to the Git repository
3. **Environment-Based Configuration**: Use environment-specific configurations for different environments 
4. **Least Privilege**: Test accounts should have minimal permissions
5. **Rotation**: Regularly rotate test credentials

## Secret Detection Tools

### Pre-commit Hook

The repository includes a pre-commit hook that automatically scans staged files for patterns that might indicate secrets or credentials. This provides a safeguard against accidentally committing sensitive information.

The pre-commit hook checks for:
- API keys and tokens
- Passwords and credentials
- Various secret formats (AWS, Stripe, Google API, etc.)
- Test credentials that should not be committed

If potential secrets are detected, the commit will be blocked with an error message indicating which files contain the problematic patterns.

### Manual Override

In rare cases where you need to bypass the pre-commit check (for false positives), you can use:

```bash
git commit --no-verify
```

However, this should be used sparingly and with extreme caution. It's better to modify the exclusion patterns in the pre-commit hook.

## Managing Test Credentials

For E2E testing with Maestro that requires authentication:

1. **Local Credential Storage**: 
   - Copy `.maestro/env.example.json` to `.maestro/env.json`
   - Add your test credentials to this file
   - This file is git-ignored and won't be committed

2. **Running Tests with Credentials**:
   ```bash
   npm run test:e2e:oidc:credentials
   ```

3. **Using Different Test Environments**:
   ```bash
   node .maestro/run-with-credentials.js .maestro/flows/oidc_login.yaml development
   ```

## CI/CD Environment

For CI/CD environments, use the secret management features of your CI platform:

1. **GitHub Actions**: Store secrets in GitHub repository settings
2. **Jenkins**: Use Jenkins Credentials Plugin
3. **GitLab CI**: Use GitLab CI/CD Variables
4. **CircleCI**: Use CircleCI Environment Variables

## Best Practices

- **Strong Passwords**: Use strong, unique passwords for test accounts
- **Dedicated Test Accounts**: Create separate accounts specifically for testing
- **Regular Auditing**: Periodically audit code and configurations for accidental secrets
- **Report Leaks**: If you discover secrets in the repository, report them immediately
- **Secret Scanning**: Consider automated secret scanning in your CI pipeline

## Additional Resources

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitLeaks Documentation](https://github.com/zricethezav/gitleaks)
- [Pre-commit Framework](https://pre-commit.com/)