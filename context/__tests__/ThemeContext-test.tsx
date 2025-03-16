import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ThemeProvider, ThemeContext, ThemeMode } from '../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Mocks are now defined in jest.setup.js

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default system theme is light
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  it('should default to system theme', async () => {
    // Setup: Mock AsyncStorage to return no saved theme
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    // Render the hook with ThemeProvider
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result, rerender } = renderHook(() => React.useContext(ThemeContext), {
      wrapper,
    });

    // Wait for AsyncStorage to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Verify default theme is 'system'
    expect(result.current.theme).toBe('system');
    expect(result.current.isSystemTheme).toBe(true);
  });

  it('should load saved theme from AsyncStorage', async () => {
    // Setup: Mock AsyncStorage to return a saved theme
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

    // Render the hook with ThemeProvider
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => React.useContext(ThemeContext), {
      wrapper,
    });

    // Wait for AsyncStorage to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Verify theme loaded from AsyncStorage
    expect(result.current.theme).toBe('dark');
    expect(result.current.isSystemTheme).toBe(false);
  });

  it('should save theme to AsyncStorage when changed', async () => {
    // Setup
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('light');

    // Render the hook with ThemeProvider
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => React.useContext(ThemeContext), {
      wrapper,
    });

    // Wait for AsyncStorage to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Change the theme
    await act(async () => {
      result.current.setTheme('dark');
    });

    // Verify the theme changed and was saved to AsyncStorage
    expect(result.current.theme).toBe('dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@opencloud_theme', 'dark');
  });

  it('should correctly set isSystemTheme flag when switching to/from system theme', async () => {
    // Setup
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('light');

    // Render the hook with ThemeProvider
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => React.useContext(ThemeContext), {
      wrapper,
    });

    // Wait for AsyncStorage to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Initially not system theme
    expect(result.current.isSystemTheme).toBe(false);

    // Change to system theme
    await act(async () => {
      result.current.setTheme('system');
    });

    // Verify isSystemTheme is true
    expect(result.current.isSystemTheme).toBe(true);

    // Change to explicit theme
    await act(async () => {
      result.current.setTheme('dark');
    });

    // Verify isSystemTheme is false again
    expect(result.current.isSystemTheme).toBe(false);
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    // Setup: Mock AsyncStorage to throw an error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    // Render the hook with ThemeProvider
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => React.useContext(ThemeContext), {
      wrapper,
    });

    // Wait for AsyncStorage to reject
    await act(async () => {
      await Promise.resolve().catch(() => {});
    });

    // Verify default theme is still used despite the error
    expect(result.current.theme).toBe('system');
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Clean up
    consoleErrorSpy.mockRestore();
  });
});