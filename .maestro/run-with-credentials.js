#!/usr/bin/env node

/**
 * Helper script to run Maestro tests with credentials from env.json
 * 
 * Usage:
 *   node run-with-credentials.js <test-flow-file> [server-key]
 * 
 * Example:
 *   node run-with-credentials.js .maestro/flows/oidc_login.yaml development
 *   
 * This will load credentials for the "Development Server" from env.json
 * If no server-key is provided, it will use the default test_credentials
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Get the flow file from command line args
const flowFile = process.argv[2];
if (!flowFile) {
  console.error('Error: No test flow file specified');
  console.error('Usage: node run-with-credentials.js <test-flow-file> [server-key]');
  process.exit(1);
}

// Optional server key (default, development, staging, etc.)
const serverKey = process.argv[3];

// Path to the credentials file
const envFilePath = path.join(__dirname, 'env.json');

// Check if credentials file exists
if (!fs.existsSync(envFilePath)) {
  console.error('Error: Credentials file not found');
  console.error('Please create .maestro/env.json from the template:');
  console.error('cp .maestro/env.example.json .maestro/env.json');
  process.exit(1);
}

// Load credentials
let credentials;
try {
  const envConfig = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
  
  if (serverKey) {
    // Find the server in the test_servers array
    const server = envConfig.test_servers.find(s => 
      s.name.toLowerCase().includes(serverKey.toLowerCase()));
    
    if (!server) {
      console.error(`Error: Server "${serverKey}" not found in credentials file`);
      process.exit(1);
    }
    
    credentials = {
      TEST_SERVER_URL: server.url,
      TEST_USERNAME: server.username,
      TEST_PASSWORD: server.password
    };
  } else {
    // Use default credentials
    credentials = {
      TEST_SERVER_URL: envConfig.test_credentials.server_url,
      TEST_USERNAME: envConfig.test_credentials.username,
      TEST_PASSWORD: envConfig.test_credentials.password
    };
  }
} catch (error) {
  console.error(`Error reading credentials: ${error.message}`);
  process.exit(1);
}

// Prepare environment variables for the Maestro command
const env = {
  ...process.env,
  ...credentials
};

// Log the test being run (without showing actual credentials)
console.log(`Running Maestro test: ${flowFile}`);
console.log(`Using credentials for server: ${serverKey || 'default'}`);
console.log(`Server URL: ${credentials.TEST_SERVER_URL}\n`);

// Run Maestro test with credentials
const maestroProcess = spawn('maestro', ['test', flowFile], { 
  env,
  stdio: 'inherit' // Show Maestro output in the console
});

maestroProcess.on('close', (code) => {
  process.exit(code);
});