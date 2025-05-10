# Setting up oidc-agent for E2E Tests

This document describes how to set up oidc-agent for use with E2E tests in OpenCloud Mobile. This approach allows you to bypass WebView authentication in tests by using pre-generated tokens.

## Installing oidc-agent

Install oidc-agent on your system:

### macOS (with Homebrew)

```bash
brew install oidc-agent
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install oidc-agent
```

### Arch Linux

```bash
sudo pacman -S oidc-agent
```

After installation, verify the version:

```bash
oidc-agent --version
```

## Starting the OIDC Agent

Start oidc-agent in your terminal:

```bash
eval "$(oidc-agent)"
```

If you want the agent to load automatically when starting a terminal, add this to your shell configuration:

```bash
# For zsh users
echo 'eval "$(oidc-agent)"' >> ~/.zshrc

# For bash users
echo 'eval "$(oidc-agent)"' >> ~/.bashrc
```

Check if the agent is running:

```bash
oidc-add --list
```

## Manual Configuration of an OIDC Account

Since OIDC providers like shniq.cloud don't support dynamic client registration, we need to create the configuration manually:

```bash
oidc-gen OpenCloudDesktop --manual
```

Follow the interactive prompts:

1. Issuer URL:
   ```
   https://shniq.cloud/
   ```

2. Client ID:
   ```
   OpenCloudDesktop
   ```
   
   > Note: We're using the "OpenCloudDesktop" client ID because this client is already registered in the Identity Provider with the appropriate localhost redirect URI. For the mobile app, OpenCloudIOS/OpenCloudAndroid would normally be the correct client IDs.

3. Client Secret:
   Since this is a public client, leave it empty (just press Enter).

4. Scopes:
   ```
   max
   ```
   
   This includes all supported scopes:
   - openid
   - offline_access
   - email
   - LibgreGraph.UUID
   - LibreGraph.RawSub
   - profile

5. Redirect URIs:
   ```
   http://localhost:5173/*
   ```

After entering the information, oidc-agent generates the configuration. You'll receive a link that you need to open in your browser to authorize access.

Once you've confirmed authorization, you'll be prompted to create a password for the configuration:

```
Enter encryption password for account configuration 'OpenCloudDesktop': 
Confirm encryption password:
```

## Retrieving an Access Token

After your OIDC profile has been successfully set up, you can retrieve your first access token:

```bash
oidc-token OpenCloudDesktop
```

This returns a JWT token that can be used for API authentication.

To set the token as an environment variable:

```bash
export OIDC_ACCESS_TOKEN=$(oidc-token OpenCloudDesktop)
```

## Automatic Use of the Refresh Token

Since we specified `offline_access` as a scope, oidc-agent has also stored a refresh token. This means:

- oidc-agent automatically renews your access token when it expires
- You can retrieve a new token at any time:
  ```bash
  oidc-token OpenCloudDesktop
  ```
- To force a new token:
  ```bash
  oidc-token OpenCloudDesktop --force-new
  ```
- To check if a refresh token exists:
  ```bash
  oidc-token -i OpenCloudDesktop
  ```

## Usage with E2E Tests

For use in E2E tests, we've implemented two approaches:

### 1. Using the NPM Script

Simply run:

```bash
npm run test:e2e:oidc:token
```

This runs the test with the default OIDC profile `OpenCloudDesktop` and the default server `https://shniq.cloud`.

### 2. With Direct Script Call and Custom Parameters

```bash
node .maestro/run-with-oidc-token.js .maestro/flows/06_oidc_token_login.yaml OpenCloudDesktop https://shniq.cloud
```

This allows you to specify a different OIDC profile and server URL.

## How It Works

1. The script retrieves an access token from oidc-agent
2. It checks if a refresh token exists
3. It runs the Maestro test and passes the tokens as environment variables
4. The test in `06_oidc_token_login.yaml` uses JavaScript injection to set the tokens in the app's local storage
5. This bypasses the need to go through the WebView authentication process

## Troubleshooting

### oidc-agent is not installed or not running

Error message:
```
Error: oidc-token command not found
```

Solution:
```bash
brew install oidc-agent
eval "$(oidc-agent)"
```

### OIDC profile does not exist

Error message:
```
Error retrieving tokens: Error: Command failed: oidc-token OpenCloudDesktop
```

Solution:
```bash
oidc-gen OpenCloudDesktop --manual
```

### Token has expired and refresh token is missing

If the access token has expired and no refresh token is available, you need to re-authenticate the profile:

```bash
oidc-gen OpenCloudDesktop --reauthenticate
```

### Additional Management Commands

- Remove OIDC account from oidc-agent:
  ```bash
  oidc-add --remove OpenCloudDesktop
  ```
- List all stored accounts:
  ```bash
  oidc-add --list
  ```