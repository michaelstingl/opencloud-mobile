import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../settings';
import { ThemeContext, ThemeMode } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { colors } from '../../themes/colors';

// Mocks are now defined in jest.setup.js

describe('Settings Screen Theme Selection', () => {
  let mockSetTheme: jest.Mock;
  let mockTheme: ThemeMode;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock system theme is light
    (useColorScheme as jest.Mock).mockReturnValue('light');
    
    // Default theme is system
    mockTheme = 'system';
    mockSetTheme = jest.fn((theme: ThemeMode) => {
      mockTheme = theme;
    });
  });
  
  const renderWithThemeContext = (theme: ThemeMode = 'system') => {
    return render(
      <ThemeContext.Provider
        value={{
          theme,
          setTheme: mockSetTheme,
          isSystemTheme: theme === 'system',
        }}
      >
        <SettingsScreen />
      </ThemeContext.Provider>
    );
  };
  
  it('should show checkmark next to selected theme', () => {
    // Render with 'light' theme
    const { getByText, queryByText, rerender } = renderWithThemeContext('light');
    
    // Light option should have a checkmark
    const lightOption = getByText('Light');
    expect(lightOption).toBeTruthy();
    
    // Get the parent container and check it has a checkmark (✓)
    const lightContainer = lightOption.parent?.parent;
    expect(lightContainer).toBeTruthy();
    expect(lightContainer?.children.length).toBeGreaterThan(1); // Should have more than one child
    
    // Find checkmark in the container
    const checkmark = queryByText('✓');
    expect(checkmark).toBeTruthy();
    
    // Dark and System options should not have checkmarks
    const darkOption = getByText('Dark');
    const systemOption = getByText(/System/); // Using regex because it might have "(light)" appended
    expect(darkOption).toBeTruthy();
    expect(systemOption).toBeTruthy();
    
    // Verify Dark theme has no checkmark
    rerender(
      <ThemeContext.Provider
        value={{
          theme: 'dark',
          setTheme: mockSetTheme,
          isSystemTheme: false,
        }}
      >
        <SettingsScreen />
      </ThemeContext.Provider>
    );
    
    // Now Dark option should have a checkmark
    const darkOptionAfterRerender = getByText('Dark');
    const darkContainer = darkOptionAfterRerender.parent?.parent;
    expect(darkContainer).toBeTruthy();
    // There should be a checkmark in the container
    expect(queryByText('✓')).toBeTruthy();
  });
  
  it('should call setTheme when a theme option is pressed', () => {
    const { getByText } = renderWithThemeContext('system');
    
    // Press the Light theme option
    fireEvent.press(getByText('Light'));
    
    // Verify setTheme was called with 'light'
    expect(mockSetTheme).toHaveBeenCalledWith('light');
    
    // Press the Dark theme option
    fireEvent.press(getByText('Dark'));
    
    // Verify setTheme was called with 'dark'
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    
    // Press the System theme option
    fireEvent.press(getByText(/System/)); // Using regex because it might have "(light)" appended
    
    // Verify setTheme was called with 'system'
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
  
  it('should display current system theme in parentheses', () => {
    // Mock system theme is light
    (useColorScheme as jest.Mock).mockReturnValue('light');
    
    // Render with 'system' theme
    const { getByText, rerender } = renderWithThemeContext('system');
    
    // Verify 'System (light)' is displayed
    expect(getByText('System (light)')).toBeTruthy();
    
    // Change system theme to dark
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    
    // Re-render
    rerender(
      <ThemeContext.Provider
        value={{
          theme: 'system',
          setTheme: mockSetTheme,
          isSystemTheme: true,
        }}
      >
        <SettingsScreen />
      </ThemeContext.Provider>
    );
    
    // Verify 'System (dark)' is displayed
    expect(getByText('System (dark)')).toBeTruthy();
  });
  
  it('should apply correct theme styles based on selected theme', () => {
    // Test light theme styles
    const { getByText, rerender } = renderWithThemeContext('light');
    
    // Get a text element and check its style includes light theme color
    const settingsTitle = getByText('Settings');
    expect(settingsTitle.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: colors.light.text })
      ])
    );
    
    // Change to dark theme and verify styles update
    rerender(
      <ThemeContext.Provider
        value={{
          theme: 'dark',
          setTheme: mockSetTheme,
          isSystemTheme: false,
        }}
      >
        <SettingsScreen />
      </ThemeContext.Provider>
    );
    
    // Get the same element and check it now has dark theme color
    const settingsTitleDark = getByText('Settings');
    expect(settingsTitleDark.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: colors.dark.text })
      ])
    );
  });
});