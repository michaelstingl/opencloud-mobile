---
sidebar_position: 4
---

# End-to-End Testing with Maestro

OpenCloud Mobile uses Maestro for end-to-end (E2E) testing. Maestro provides a simple way to write and run UI tests that simulate user interactions with the app, including support for complex scenarios like WebView-based OIDC authentication.

## What is Maestro?

Maestro is a mobile UI testing framework that allows you to:

- Write tests in simple YAML format
- Test real user flows through your app
- Interact with WebViews and native components seamlessly
- Record tests with Maestro Studio
- Run tests locally or in CI environments

## Setup

### Installation

1. Install Java (Maestro requires a Java Runtime):

```bash
brew install openjdk
```

2. Configure Java in your PATH by adding this to your shell profile (~/.zshrc or ~/.bash_profile):

```bash
export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
```

3. Apply the changes and verify Java installation:

```bash
source ~/.zshrc  # or source ~/.bash_profile
java -version
```

4. Install Maestro using Homebrew:

```bash
brew tap mobile-dev-inc/tap
brew install maestro
```

5. Verify Maestro installation:

```bash
maestro --version
```

For other platforms, see the [official Maestro documentation](https://maestro.mobile.dev/getting-started/installing-maestro).

### Project Structure

E2E tests are located in the `.maestro/flows/` directory at the root of the project. The structure looks like:

```
.maestro/
  ├── README.md
  ├── env.example.json  # Template for test credentials
  ├── run-with-credentials.js  # Helper script for using credentials
  └── flows/
      ├── 01_login_screen.yaml
      ├── 02_theme_settings.yaml
      ├── 03_screenshot_login.yaml
      ├── 04_login_with_confirmation.yaml
      └── 05_oidc_login.yaml
```

## Running Tests

We've added npm scripts to make running Maestro tests easier:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific tests
npm run test:e2e:login              # Test login screen
npm run test:e2e:theme              # Test theme switching
npm run test:e2e:screenshots        # Capture login screenshots
npm run test:e2e:login:confirmation # Test with dialog confirmation
npm run test:e2e:oidc               # Test OIDC authentication flow
npm run test:e2e:oidc:credentials   # Run OIDC test with credentials
```

### Prerequisites for Running Tests

1. Ensure you have a device or emulator/simulator connected
2. Build and install the app on the device first with:
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## Writing Maestro Tests

Maestro tests are written in YAML. Here's a simple example that tests the login screen:

```yaml
appId: eu.opencloud.mobile
---
- launchApp
- assertVisible: "Login"
```

### Example: Theme Settings Test

This test checks the theme switching functionality:

```yaml
appId: eu.opencloud.mobile
---
- launchApp
# Navigate to Settings
- tapOn: "Settings"
# Check if Theme section exists
- assertVisible: "Theme"
# Switch to Dark Mode
- tapOn: "Dark"
# Verify Dark Mode is activated
- assertVisible:
    text: "Dark"
    checked: true
# Switch to Light Mode
- tapOn: "Light"
# Verify Light Mode is activated
- assertVisible:
    text: "Light"
    checked: true
# Switch to System Mode
- tapOn: "System"
# Verify System Mode is activated
- assertVisible:
    text: "System"
    checked: true
```

## WebView Testing

A key feature of our app is OIDC authentication, which involves WebViews. Maestro can interact with elements inside WebViews using JavaScript injection.

### Handling System Dialogs

When testing OIDC authentication, you'll encounter system dialogs like:

```
"opencloudmobile" Wants to Use "example.com" to Sign In
This allows the app and website to share information about you.

[Cancel] [Continue]
```

These system dialogs **require manual intervention** as Maestro cannot directly interact with them. There are two approaches to handle this:

1. **Semi-automated tests with manual steps**:
   - Use `extendedWaitUntil` with a timeout to pause the test
   - Manually press "Continue" during test execution
   - The test will automatically continue once the expected UI element appears

   ```yaml
   # After tapping Connect button, a system dialog appears
   - tapOn: "Connect"
   
   # Pause and wait for manual intervention
   - extendedWaitUntil:
       visible: "Username"  # Element that appears after dialog is dismissed
       timeout: 30000       # 30 seconds to manually press "Continue"
   ```

2. **Separate tests for different stages**:
   - Create one test for the initial login screen
   - Create another test that assumes the dialog is already confirmed
   - Run these tests separately with manual intervention between them

### Example: OIDC Login Test with Manual Intervention

```yaml
appId: eu.opencloud.mobile
---
- launchApp
# Start login process
- tapOn: "Login"
# Enter server URL
- tapOn: "Server URL"
- inputText: "https://demo.opencloud.example.com"
- tapOn: "Continue"

# System Dialog appears here - requires manual intervention
# Wait up to 30 seconds for user to press "Continue" on the system dialog
- extendedWaitUntil:
    visible: "Username"
    timeout: 30000

# Once the dialog is confirmed and WebView loads
- runScript: |
    // This JavaScript will run in the WebView context
    // Identify input fields and buttons in the login form
    const usernameField = document.querySelector('input[name="username"]');
    const passwordField = document.querySelector('input[name="password"]');
    const loginButton = document.querySelector('button[type="submit"]');
    
    // Fill in test credentials
    if (usernameField) usernameField.value = "test_user";
    if (passwordField) passwordField.value = "test_password";
    
    // Click login button
    if (loginButton) loginButton.click();
# Wait for login to complete and redirect back to app
- waitForAnimationToEnd
# Verify successful login by checking for dashboard elements
- assertVisible: "Files"
```

## Taking Screenshots

Maestro provides an easy way to capture screenshots during test execution. To save screenshots directly in your project directory, specify the path in the screenshot command:

```yaml
- takeScreenshot: 
    path: ".maestro/screenshots/01_welcome_screen"
```

This will save the screenshot as `01_welcome_screen.png` in the `.maestro/screenshots/` directory of your project. The example below shows how to capture multiple screenshots throughout a test flow:

```yaml
appId: com.anonymous.opencloud-mobile
---
- launchApp
- takeScreenshot: 
    path: ".maestro/screenshots/01_welcome_screen"
- tapOn: "https://your-server.com or 'demo'"
- inputText: "demo"
- takeScreenshot: 
    path: ".maestro/screenshots/02_filled_login_form"
```

Screenshots are useful for:
- Documenting the UI flow
- Reviewing test results
- Creating documentation
- Verifying visual elements
- Sharing test results with the team

## Credentials Management

For tests that require real credentials, we recommend a secure approach:

1. **Local Environment Variables**:
   - Create a `.maestro/env.json` file (git-ignored)
   - Use environment variables in your test flows:

   ```yaml
   appId: eu.opencloud.mobile
   env:
     SERVER_URL: ${TEST_SERVER_URL}
     USERNAME: ${TEST_USERNAME}
     PASSWORD: ${TEST_PASSWORD}
   ---
   # Later in the script, reference these variables:
   - inputText: "${SERVER_URL}"
   # And in the runScript for WebView:
   - runScript: |
       if (usernameField) usernameField.value = "${USERNAME}";
       if (passwordField) passwordField.value = "${PASSWORD}";
   ```

2. **Helper Script**:
   - Use a script to load credentials from `.env.json` and run tests
   - Convenient way to run OIDC tests without exposing credentials:
   
   ```bash
   npm run test:e2e:oidc:credentials
   ```

3. **CI Environment**:
   - When running in CI environments, use CI platform's secrets management
   - Never store real credentials in your test files

## Integration with CI/CD

To integrate Maestro tests with your CI/CD pipeline (e.g., GitHub Actions):

1. Install Maestro on the CI runner
2. Build and install the app
3. Run tests using `npm run test:e2e`
4. Parse the output for success/failure

For more details on CI integration, see the [Maestro CI documentation](https://maestro.mobile.dev/platform/maestro-cloud).

## Recording New Tests

To record a new test flow:

```bash
maestro studio
```

Follow the on-screen instructions to record your interactions with the app.

## Best Practices

1. **Keep tests focused**: Each test should verify a specific feature or flow
2. **Make tests independent**: Tests should not depend on each other
3. **Use descriptive names**: Name tests based on what they verify
4. **Handle loading states**: Use `waitForAnimationToEnd` or similar to wait for content to load
5. **Test edge cases**: Test both happy paths and error scenarios
6. **Update tests when UI changes**: Keep tests in sync with UI changes
7. **Use test credentials**: Never use real user credentials in tests
8. **Screenshots organization**: Keep screenshots organized in subdirectories by flow

## Troubleshooting

Common issues and solutions:

- **Element not found**: Check if the text or ID you're targeting is correct
- **WebView interaction issues**: Ensure the WebView has fully loaded before interacting with it
- **Test runs too fast**: Add waits or use `waitForAnimationToEnd` to ensure UI is ready
- **App crashes during test**: Check logs for errors and ensure the app state is as expected
- **System dialog issues**: Remember that system dialogs require manual interaction

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro GitHub Repository](https://github.com/mobile-dev-inc/maestro)
- [Example Flows](https://maestro.mobile.dev/api-reference/commands)