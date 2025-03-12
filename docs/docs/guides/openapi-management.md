---
sidebar_position: 5
---

# OpenAPI Specification Management

The OpenCloud Mobile app uses the OpenAPI specification to interact with the OpenCloud backend API. This guide explains how we manage and utilize the OpenAPI specification in the project.

## About the OpenAPI Specification

The OpenAPI specification (formerly known as Swagger) is a standard format for describing REST APIs. It defines the structure of API endpoints, request and response formats, authentication methods, and more in a machine-readable format.

For the OpenCloud Mobile app, we use the LibreGraph API specification, which follows the OpenAPI 3.0.1 format.

## How We Use the OpenAPI Specification

The OpenAPI specification serves several important purposes in our project:

1. **API Documentation**: It provides detailed documentation of available endpoints and operations
2. **Type Definitions**: It defines the data types used in API requests and responses
3. **Consistency**: It ensures consistent API usage across the app
4. **Validation**: It helps validate requests and responses against the expected format

## Managing the Specification

### Local Copy

We maintain a local copy of the OpenAPI specification in our repository at:

```
docs/docs/api/specs/openapi-v1.0.yaml
```

This file is used as a reference for developers and tooling, and is periodically updated to match the latest version from the server.

### Update Script

To simplify keeping the local copy up-to-date, we've created an update script:

```bash
./scripts/update-openapi.sh
```

This script downloads the latest specification from the OpenCloud servers and updates our local copy. It's a good practice to run this script periodically to ensure you're working with the most recent API definitions.

The script is also referenced in our `CLAUDE.md` file for convenient access.

## Implementation in the Code

### API Service Implementation

The ApiService in our app is designed around the structure defined in the OpenAPI specification:

1. **Endpoint Structure**: Our API service methods correspond to the endpoints defined in the specification
2. **Type Safety**: We use TypeScript interfaces derived from the specification for request and response types
3. **Error Handling**: Error responses follow the format defined in the specification

### HTTP Standards Compliance

Our implementation of the API client follows all the HTTP standards outlined in the [HTTP Standards Guide](./http-standards), including:

- Standardized headers
- Manual redirect handling
- Comprehensive logging
- Security measures

## TypeScript Integration

### TypeScript Interface Generation

While we haven't fully automated this process yet, the OpenAPI specification can be used to generate TypeScript interfaces for API requests and responses. This ensures type safety and reduces manual coding errors.

Tools that can be used for generating TypeScript interfaces include:

- OpenAPI Generator
- Swagger Codegen
- NSwag

An example command to generate TypeScript interfaces using OpenAPI Generator:

```bash
openapi-generator-cli generate -i docs/docs/api/specs/openapi-v1.0.yaml -g typescript-fetch -o src/generated/api
```

### Manual Type Definitions

In some cases, we manually define TypeScript interfaces based on the OpenAPI specification to have more control over the generated code. These type definitions are located in the `types` directory.

## Future Improvements

We plan to implement the following improvements to our OpenAPI specification usage:

1. **Automated Type Generation**: Set up a CI/CD pipeline to automatically generate TypeScript interfaces from the specification
2. **Runtime Validation**: Add runtime validation of API responses against the specification
3. **Mock Server**: Use the specification to create a mock server for testing

## Best Practices

When working with the API:

1. **Consult the Specification**: Before implementing a new API call, consult the OpenAPI specification to understand the expected request and response format
2. **Update Regularly**: Run the update script regularly to ensure you're working with the latest API definitions
3. **Type Safety**: Use the TypeScript interfaces derived from the specification for type safety
4. **Error Handling**: Handle errors according to the error formats defined in the specification