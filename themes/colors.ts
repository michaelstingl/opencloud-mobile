/**
 * OpenCloud Mobile color scheme
 * Centralized color definitions for the application
 */

export const colors = {
  light: {
    // Base colors
    text: '#000000',
    background: '#FFFFFF',
    tint: '#2f95dc',
    
    // UI Elements
    surface: '#FFFFFF',
    surfaceVariant: '#F7F9FC',
    border: '#E1E4E8',
    borderLight: '#F0F0F0',
    
    // Interactive elements
    primary: '#007AFF',  // iOS blue
    primaryVariant: '#81B0FF',
    secondary: '#2f95dc',
    
    // Status colors
    success: '#34C759',  // iOS green
    warning: '#FF9500',  // iOS orange
    error: '#FF3B30',    // iOS red
    info: '#5AC8FA',     // iOS light blue
    
    // Tab navigation
    tabIconDefault: '#CCCCCC',
    tabIconSelected: '#2f95dc',
    
    // Text variants
    textSecondary: '#777777',
    textDisabled: '#A0A0A0',
    textLink: '#007AFF',
    
    // Controls
    switchTrackOff: '#767577',
    switchTrackOn: '#81B0FF',
    switchThumbOff: '#F4F3F4',
    switchThumbOn: '#007AFF',
    switchIOSBackground: '#3E3E3E',
    
    // Buttons
    buttonBackground: '#F0F0F0',
    buttonDisabledBackground: '#F8F8F8',
    buttonDisabledText: '#A0A0A0',
    buttonBorder: '#E5E5E5',
    badgeBackground: '#F0F0F0',
    badgeText: '#888888',
  },
  
  dark: {
    // Base colors
    text: '#FFFFFF',
    background: '#000000',
    tint: '#FFFFFF',
    
    // UI Elements
    surface: '#1C1C1E',   // iOS dark mode card/surface color
    surfaceVariant: '#2C2C2E',
    border: '#38383A',
    borderLight: '#2C2C2E',
    
    // Interactive elements
    primary: '#0A84FF',   // iOS dark mode blue
    primaryVariant: '#5E5CE6',
    secondary: '#64D2FF',
    
    // Status colors
    success: '#30D158',   // iOS dark mode green
    warning: '#FF9F0A',   // iOS dark mode orange
    error: '#FF453A',     // iOS dark mode red
    info: '#64D2FF',      // iOS dark mode light blue
    
    // Tab navigation
    tabIconDefault: '#CCCCCC',
    tabIconSelected: '#FFFFFF',
    
    // Text variants
    textSecondary: '#EBEBF5',
    textDisabled: '#8E8E93',
    textLink: '#0A84FF',
    
    // Controls
    switchTrackOff: '#39393D',
    switchTrackOn: '#5E5CE6',
    switchThumbOff: '#FFFFFF',
    switchThumbOn: '#FFFFFF',
    switchIOSBackground: '#636366',
    
    // Buttons
    buttonBackground: '#2C2C2E',
    buttonDisabledBackground: '#1C1C1E',
    buttonDisabledText: '#8E8E93',
    buttonBorder: '#38383A',
    badgeBackground: '#2C2C2E',
    badgeText: '#EBEBF5',
  }
};

// Semantic color names that can be used application-wide
export const semantic = {
  // Add any semantic color mappings here
  // Example: danger: colors.light.error (in light mode) or colors.dark.error (in dark mode)
};