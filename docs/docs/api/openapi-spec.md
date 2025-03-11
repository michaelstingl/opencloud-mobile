---
sidebar_position: 2
---

# OpenAPI Specification

The OpenCloud backend API is documented using the OpenAPI specification (also known as Swagger). The specification defines the API endpoints, request/response formats, and authentication requirements.

## LibreGraph API

The LibreGraph API is the primary interface for the OpenCloud Mobile application to interact with the backend server.

### Specification Resources

The OpenAPI specification for the LibreGraph API is available at:

- [Online Documentation](https://docs.opencloud.eu/swagger/libre-graph-api/)
- [YAML Specification](https://docs.opencloud.eu/swagger/libre-graph-api/api/openapi-spec/v1.0.yaml)

### Using the API

To use the LibreGraph API in the OpenCloud Mobile application:

1. Authenticate using OpenID Connect (see the [Authentication Guide](/docs/guides/authentication))
2. Include the access token in API requests
3. Handle responses according to the specification

### Local Copy

A local copy of the OpenAPI specification is stored in `docs/docs/api/specs/openapi-v1.0.yaml`. This file should be updated periodically to match the latest version from the server.

To download and update the local copy:

```bash
curl -o docs/docs/api/specs/openapi-v1.0.yaml https://docs.opencloud.eu/swagger/libre-graph-api/api/openapi-spec/v1.0.yaml
```

## API Client Generation

The OpenAPI specification can be used to generate API clients for TypeScript/JavaScript. This ensures type safety and reduces manual coding errors when interacting with the API.

Tools for client generation:
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Swagger Codegen](https://swagger.io/tools/swagger-codegen/)
- [NSwag](https://github.com/RicoSuter/NSwag)