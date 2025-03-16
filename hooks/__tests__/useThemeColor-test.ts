import { useThemeColor } from '../useThemeColor';
import { useColorScheme } from 'react-native';
import { ThemeContext, ThemeMode } from '../../context/ThemeContext';
import { colors } from '../../themes/colors';

// Mock React Native's useColorScheme
// Mocks are now defined in jest.setup.js
// We just need to add the useContext mock
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn()
}));

// Import React to access the mocked useContext
import React from 'react';

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the light color when theme is explicitly set to light', () => {
    // Setup
    (useColorScheme as jest.Mock).mockReturnValue('dark'); // System theme is dark
    (React.useContext as jest.Mock).mockReturnValue({ theme: 'light' as ThemeMode }); // But explicit theme is light
    
    // Test
    const color = useThemeColor({ light: 'red', dark: 'blue' }, 'text');
    
    // Assert
    expect(color).toBe('red');
  });
  
  it('should return the dark color when theme is explicitly set to dark', () => {
    // Setup
    (useColorScheme as jest.Mock).mockReturnValue('light'); // System theme is light
    (React.useContext as jest.Mock).mockReturnValue({ theme: 'dark' as ThemeMode }); // But explicit theme is dark
    
    // Test
    const color = useThemeColor({ light: 'red', dark: 'blue' }, 'text');
    
    // Assert
    expect(color).toBe('blue');
  });
  
  it('should use system theme when theme is set to system', () => {
    // Setup
    (useColorScheme as jest.Mock).mockReturnValue('dark'); // System theme is dark
    (React.useContext as jest.Mock).mockReturnValue({ theme: 'system' as ThemeMode }); // Theme is system
    
    // Test
    const color = useThemeColor({ light: 'red', dark: 'blue' }, 'text');
    
    // Assert - should use dark because system theme is dark
    expect(color).toBe('blue');
  });

  it('should use default light theme if system returns null and theme is system', () => {
    // Setup
    (useColorScheme as jest.Mock).mockReturnValue(null); // System theme is undefined/null
    (React.useContext as jest.Mock).mockReturnValue({ theme: 'system' as ThemeMode }); // Theme is system
    
    // Test
    const color = useThemeColor({ light: 'red', dark: 'blue' }, 'text');
    
    // Assert - should default to light theme
    expect(color).toBe('red');
  });

  it('should use theme-defined colors when props dont specify color', () => {
    // Setup
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (React.useContext as jest.Mock).mockReturnValue({ theme: 'light' as ThemeMode });
    
    // Test with no color props
    const color = useThemeColor({}, 'text');
    
    // Assert
    expect(color).toBe(colors.light.text);
  });

  it('should prioritize props colors over theme colors', () => {
    // Setup
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (React.useContext as jest.Mock).mockReturnValue({ theme: 'light' as ThemeMode });
    
    // Test with custom props
    const color = useThemeColor({ light: 'customLightColor', dark: 'customDarkColor' }, 'text');
    
    // Assert - should use custom prop color, not theme color
    expect(color).toBe('customLightColor');
    expect(color).not.toBe(colors.light.text);
  });
});