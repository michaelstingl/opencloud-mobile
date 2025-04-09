# Maestro E2E Tests for OpenCloud Mobile

This directory contains Maestro flows for end-to-end testing of the OpenCloud Mobile app.

## Setup

1. Install Java (required by Maestro):
   ```bash
   # macOS
   brew install openjdk
   
   # Add Java to your PATH (add to ~/.zshrc or ~/.bash_profile)
   export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
   
   # Apply the changes and verify Java installation
   source ~/.zshrc  # or source ~/.bash_profile
   java -version
   ```

2. Install Maestro:
   ```bash
   # macOS
   brew tap mobile-dev-inc/tap && brew install maestro
   
   # Other platforms
   curl -Ls "https://get.maestro.mobile.dev" | bash
   
   # Verify installation
   maestro --version
   ```

3. Ensure your app is built and installed on a device or emulator/simulator

4. Set up test credentials (optional):
   ```bash
   # Create your credentials file from the template
   cp .maestro/env.example.json .maestro/env.json
   
   # Edit the file with your actual credentials
   # This file is git-ignored and won't be committed
   ```

5. For token-based OIDC tests, see [OIDC Agent Setup](./.maestro/OIDC_AGENT_SETUP.md)

## Running Tests

To run a specific test flow:

```bash
maestro test .maestro/flows/login_screen.yaml
```

To run all tests:

```bash
maestro test .maestro/flows/
```

With environment variables for credentials:

```bash
TEST_SERVER_URL=https://example.com TEST_USERNAME=user TEST_PASSWORD=pass maestro test .maestro/flows/oidc_login.yaml
```

## Test Flows

- `01_login_screen.yaml`: Verifies the login screen appears when the app launches
- `02_theme_settings.yaml`: Tests theme switching functionality (Light/Dark/System)
- `03_screenshot_login.yaml`: Captures screenshots of the login process
- `04_login_with_confirmation.yaml`: Tests login flow with manual dialog confirmation
- `05_oidc_login.yaml`: Tests the OIDC authentication flow with WebView support (requires manual intervention)
- `06_oidc_token_login.yaml`: Tests OIDC authentication by injecting tokens from oidc-agent (no WebView)

## System Dialogs & Manual Intervention

Some tests require manual intervention due to system security dialogs that cannot be automatically interacted with:

1. **OIDC Login Dialog**: When connecting to an OIDC provider, iOS shows a permission dialog:
   ```
   "opencloudmobile" Wants to Use "shniq.cloud" to Sign In
   This allows the app and website to share information about you.
   
   [Cancel] [Continue]
   ```
   
   For these tests:
   - The test will pause using `extendedWaitUntil` with a timeout
   - You must manually press "Continue" during the test
   - The test will then continue automatically once the web page loads

2. **Running Tests with Manual Steps**:
   ```bash
   maestro test .maestro/flows/login_with_confirmation.yaml
   ```
   - Be ready to interact with system dialogs when they appear
   - The test includes comments indicating when manual intervention is needed

3. **Avoiding Manual Intervention**:
   - Use the token injection approach with oidc-agent:
   ```bash
   npm run test:e2e:oidc:token
   ```
   - This approach bypasses WebView authentication entirely

## Test Credentials

For tests that require authentication with real servers:

1. Never commit real credentials to Git
2. Use the environment variables approach or credentials file:
   - Copy `env.example.json` to `env.json` and edit with your credentials
   - Use environment variables when running Maestro tests
3. Use dedicated test accounts with minimal permissions
4. For CI environments, use secrets management for credentials

## WebView Testing

For WebView-based authentication flows, Maestro uses JavaScript injection to interact with elements inside the WebView. The `runScript` command in the `oidc_login.yaml` flow demonstrates this approach.

Example of using credentials in a WebView test:

```yaml
env:
  USERNAME: ${TEST_USERNAME}
  PASSWORD: ${TEST_PASSWORD}
---
# ... other test steps ...
- runScript:
    file: auth_login.js
```

## OIDC Token Injection

The `06_oidc_token_login.yaml` test demonstrates a way to bypass WebView authentication by using pre-generated tokens from oidc-agent.

1. Set up oidc-agent following the [OIDC Agent Setup guide](./OIDC_AGENT_SETUP.md)

2. Run the test with token injection:
   ```bash
   npm run test:e2e:oidc:token
   ```

This bypasses the WebView authentication flow completely, making tests more reliable and faster.

## Screenshots

Screenshots are saved to the `.maestro/screenshots/` directory, organized by test flow:
- `login_flow/`: Screenshots from login flow tests
- `oidc_flow/`: Screenshots from OIDC authentication flow tests
- `oidc_token_flow/`: Screenshots from OIDC token injection flow tests
- `auth_flow/`: Screenshots from authentication flow tests

These directories are git-ignored to avoid committing screenshots to the repository.

## Recording New Tests

To record a new test flow:

```bash
maestro studio
```

Follow the on-screen instructions to record your interactions with the app.