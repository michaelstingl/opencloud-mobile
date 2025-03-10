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