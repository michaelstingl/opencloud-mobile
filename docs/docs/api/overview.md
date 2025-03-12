---
sidebar_position: 1
---

# API Overview

The OpenCloud Mobile app provides several key APIs and components that you can use in your development. This section provides an overview of the available APIs.

## Backend API

The application communicates with the OpenCloud backend using the LibreGraph API:

- [OpenAPI Specification](openapi-spec.md) - Documentation of the LibreGraph API

## Components

The app includes reusable React components that follow consistent design patterns:

- **UI Components** - Buttons, inputs, cards, and other UI elements
- **Layout Components** - Structural components for organizing the UI
- **Data Display Components** - Components for displaying files, folders, and other data

## Hooks

Custom React hooks provide reusable logic across the application:

- **useAuth** - Authentication-related functionality
- **useFiles** - File operations and management
- **useSync** - Data synchronization
- **useSettings** - User settings and preferences

## Services

Service modules handle external communication and data processing:

- **API Service** - Handles communication with the OpenCloud server
- **Auth Service** - Manages authentication and authorization
  - **WebFingerService** - Handles WebFinger discovery for OpenID Connect
  - **OidcService** - Handles OpenID Connect operations and configuration
- **Storage Service** - Handles local storage and caching
- **File Service** - Manages file operations

## HTTP Utilities

The shared HTTP utilities provide standardized networking capabilities:

- **HttpUtil** - Centralized HTTP utility functions for all services:
  - **generateUuid()** - Generates RFC-compliant UUID v4 for request correlation
  - **createStandardHeaders()** - Creates consistent headers for all requests
  - **createRequestOptions()** - Creates fetch options with standardized settings
  - **generateCurlCommand()** - Generates equivalent curl commands for debugging
  - **logRequest()** - Standardized request logging with redaction of sensitive data
  - **logResponse()** - Standardized response logging with performance metrics

## Utilities

Helper functions and utilities for common tasks:

- **Error Handling** - Functions for processing and displaying errors
- **Formatting** - Date, file size, and other formatting utilities
- **Validation** - Input validation functions
- **Navigation** - Navigation utilities and helpers

## Type Definitions

TypeScript type definitions for the app's data structures:

- **User Types** - User-related type definitions
- **File Types** - File and folder type definitions
- **API Types** - Types for API requests and responses
- **Auth Types**:
  - **WebFinger** - Types for WebFinger responses and links
  - **OIDC** - Types for OpenID Connect configuration