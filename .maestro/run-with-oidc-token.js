#!/usr/bin/env node

/**
 * Helper script to run Maestro tests with OIDC tokens from oidc-agent
 * 
 * Usage:
 *   node run-with-oidc-token.js <test-flow-file> <oidc-profile-name> [server-url]
 * 
 * Example:
 *   node run-with-oidc-token.js .maestro/flows/06_oidc_token_login.yaml OpenCloudDesktop https://shniq.cloud
 *   
 * This will fetch tokens for the specified OIDC profile from oidc-agent
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// Get the flow file from command line args
const flowFile = process.argv[2];
if (!flowFile) {
  console.error('Error: No test flow file specified');
  console.error('Usage: node run-with-oidc-token.js <test-flow-file> <oidc-profile-name> [server-url]');
  process.exit(1);
}

// Get the OIDC profile name and server URL from arguments or env file
let oidcProfile = process.argv[3];
let serverUrl = process.argv[4];

// If not provided, try to load from env.json
if (!oidcProfile || !serverUrl) {
  try {
    const envFilePath = path.join(__dirname, 'env.json');
    if (fs.existsSync(envFilePath)) {
      const envConfig = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
      
      if (!oidcProfile && envConfig.oidc_config && envConfig.oidc_config.default_profile) {
        oidcProfile = envConfig.oidc_config.default_profile;
        console.log(`Using default OIDC profile from env.json: ${oidcProfile}`);
      }
      
      if (!serverUrl && envConfig.oidc_config && envConfig.oidc_config.default_server) {
        serverUrl = envConfig.oidc_config.default_server;
        console.log(`Using default server URL from env.json: ${serverUrl}`);
      }
    }
  } catch (error) {
    // Continue with defaults or fail if required values are missing
  }
}

// Final check for required values
if (!oidcProfile) {
  console.error('Error: No OIDC profile name specified');
  console.error('Usage: node run-with-oidc-token.js <test-flow-file> <oidc-profile-name> [server-url]');
  console.error('Or create .maestro/env.json with oidc_config.default_profile');
  process.exit(1);
}

// Default server URL if not provided anywhere
if (!serverUrl) {
  serverUrl = 'https://example.com';
  console.warn(`Warning: No server URL specified, using default: ${serverUrl}`);
  console.warn('You should specify a server URL as an argument or in env.json');
}

// Check if oidc-agent is available
try {
  execSync('which oidc-token', { stdio: 'ignore' });
} catch (error) {
  console.error('Error: oidc-token command not found');
  console.error('Please install oidc-agent and ensure it is in your PATH');
  console.error('See: https://github.com/indigo-dc/oidc-agent#installation');
  process.exit(1);
}

// Get tokens from oidc-agent
let accessToken, refreshToken;
try {
  // Get access token
  accessToken = execSync(`oidc-token ${oidcProfile}`, { encoding: 'utf8' }).trim();
  console.log(`Retrieved access token for ${oidcProfile}`);
  
  // Get token info to check if refresh token exists
  const tokenInfo = execSync(`oidc-token -i ${oidcProfile}`, { encoding: 'utf8' }).trim();
  const hasRefreshToken = tokenInfo.includes('refresh token is set');
  
  if (hasRefreshToken) {
    console.log('Refresh token is available');
    // We can't directly get the refresh token via cli, but it will be used automatically
    refreshToken = 'refresh_token_managed_by_oidc_agent';
  } else {
    console.warn('No refresh token available. Authentication may expire.');
    refreshToken = '';
  }
} catch (error) {
  console.error(`Error retrieving tokens: ${error.message}`);
  console.error('Make sure oidc-agent is running and the profile exists:');
  console.error('  eval "$(oidc-agent)"');
  console.error(`  oidc-gen ${oidcProfile} --manual  # if the profile doesn't exist yet`);
  process.exit(1);
}

// Prepare environment variables for the Maestro command
const env = {
  ...process.env,
  OIDC_ACCESS_TOKEN: accessToken,
  OIDC_REFRESH_TOKEN: refreshToken,
  SERVER_URL: serverUrl
};

// Log the test being run (without showing actual tokens)
console.log(`Running Maestro test: ${flowFile}`);
console.log(`Using OIDC profile: ${oidcProfile}`);
console.log(`Server URL: ${serverUrl}\n`);
console.log('Access token retrieved successfully (not shown for security)');

// Run Maestro test with tokens
const maestroProcess = spawn('maestro', ['test', flowFile], { 
  env,
  stdio: 'inherit' // Show Maestro output in the console
});

maestroProcess.on('close', (code) => {
  process.exit(code);
});