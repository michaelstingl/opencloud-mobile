---
sidebar_position: 1
---

# Architecture Overview

This document provides an overview of the OpenCloud Mobile architecture, explaining the main components and how they interact with each other.

## High-Level Architecture

OpenCloud Mobile follows a modern React Native architecture with Expo:

```
├── App (Root)
│   ├── Navigation (Expo Router)
│   ├── Screens
│   ├── Components
│   ├── Hooks
│   ├── Services
│   └── Utils
```

### Core Principles

The architecture follows these core principles:

1. **Component-Based Design**: UI is built using reusable components
2. **Separation of Concerns**: Different aspects of the app are separated into logical modules
3. **TypeScript**: Strong typing to ensure code quality and maintainability
4. **Hooks-Based Logic**: Application logic is encapsulated in custom hooks
5. **Service-Based APIs**: External communication is handled by dedicated services

## Key Architectural Components

### Navigation

The app uses Expo Router for file-based navigation, which provides:

- Automatic route generation based on file structure
- Deep linking support
- Type-safe navigation

### State Management

State management is handled through:

- React Context for global state
- React Query for server state
- Local component state for UI-specific state

### Data Flow

Data flows through the application in the following way:

1. **User Interaction**: User interacts with UI components
2. **Component Handlers**: Components call handlers in hooks or services
3. **Services**: Services make API calls or update local state
4. **State Updates**: Updated state flows back to components

### Server Communication

Communication with the OpenCloud server is handled by a dedicated API service that:

- Makes HTTP requests to the server
- Handles authentication
- Processes responses
- Manages error handling

### Authentication Flow

The app uses OpenID Connect (OIDC) for authentication with the OpenCloud server:

1. **Server Connection**: User enters the server URL in the connection screen.

2. **WebFinger Discovery**: 
   - The app performs a WebFinger lookup to the `/.well-known/webfinger` endpoint.
   - It looks for the OpenID Connect issuer link with the relation `http://openid.net/specs/connect/1.0/issuer`.

3. **OIDC Configuration**:
   - The app retrieves the OpenID Connect configuration from `/.well-known/openid-configuration`.
   - This provides essential endpoints like authorization, token, and userinfo.

4. **Authorization**:
   - The app constructs an authorization URL and opens it in a browser.
   - The user logs in on the server's login page.
   - After successful login, the server redirects back to the app with an authorization code.

5. **Token Exchange**:
   - The app exchanges the authorization code for access and refresh tokens.
   - These tokens are used for subsequent API calls.

This flow is implemented using dedicated services for WebFinger discovery, OIDC operations, and overall authentication coordination.

### Configuration Architecture

The app uses a centralized configuration system designed for flexibility and white-labeling support:

1. **Core Configuration Layer**:
   - Central configuration files in the `/config` directory
   - Type-safe configuration using TypeScript interfaces
   - Platform-specific settings (different values for iOS vs Android)

2. **Configuration Categories**:
   - Authentication: Client IDs, redirect URIs, scopes
   - API: Timeouts, endpoints, retry strategies
   - UI: Theme settings, feature flags

3. **White-Labeling Support**:
   - Configuration designed to support multiple branded versions of the app
   - Build-time configuration using environment variables or build arguments
   - Client-specific overrides for visual elements and behavior

4. **Platform-Specific Configuration**:
   - Different client IDs per platform (iOS: `OpenCloudIOS`, Android: `OpenCloudAndroid`)
   - Platform-specific redirect URIs for authentication (iOS: `oc://ios.opencloud.eu`, Android: `oc://android.opencloud.eu`)
   - Platform detection using React Native's `Platform` API
   - Conditional configuration based on runtime environment

### Error Handling

The app implements a centralized error handling system that:

- Captures errors from various sources
- Formats errors for user display
- Logs errors for debugging
- Provides recovery mechanisms where possible

## File Structure

The project follows this file structure:

```
opencloud-mobile/
├── app/                  # Expo Router pages
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── services/             # API and business logic services
├── utils/                # Helper functions and utilities
├── types/                # TypeScript type definitions
└── assets/               # Static assets like images
```

## Dependency Diagram

Key dependencies between components:

```
Screens → Components → Hooks → Services → API
    ↓           ↓        ↓         ↓
   Utils ──────────────────────────┘
```

## Technology Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development framework and tooling
- **TypeScript**: Programming language
- **Expo Router**: Navigation
- **React Query**: Data fetching and caching
- **Jest**: Testing framework