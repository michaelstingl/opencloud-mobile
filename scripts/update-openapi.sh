#!/bin/bash

# Script to update OpenAPI specification file
# Usage: ./scripts/update-openapi.sh

# Create directory if it doesn't exist
mkdir -p docs/docs/api/specs

# Download the latest OpenAPI specification
echo "Downloading OpenAPI specification..."
curl -o docs/docs/api/specs/openapi-v1.0.yaml https://docs.opencloud.eu/swagger/libre-graph-api/api/openapi-spec/v1.0.yaml

# Check if download was successful
if [ $? -eq 0 ]; then
  echo "✅ OpenAPI specification updated successfully"
  echo "Location: docs/docs/api/specs/openapi-v1.0.yaml"
else
  echo "❌ Failed to download OpenAPI specification"
  exit 1
fi