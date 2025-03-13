import React from 'react';
import { render } from '@testing-library/react-native';
import TestScreen from '../test';

// Mock the router to avoid router usage in tests
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock ApiService
jest.mock('../../services/api/ApiService', () => ({
  ApiService: {
    enableMockDataMode: jest.fn(),
  },
}));

describe('TestScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<TestScreen />);
    
    // Check for the main text elements
    expect(getByText('Test Screen')).toBeTruthy();
    expect(getByText('Navigation works! You can now proceed to the account screen or go back home.')).toBeTruthy();
    expect(getByText('Go to Account Screen')).toBeTruthy();
    expect(getByText('Go Back to Home')).toBeTruthy();
  });
});