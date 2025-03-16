---
sidebar_position: 4
---

# Theming System

OpenCloud Mobile includes a comprehensive theming system that supports light, dark, and system-defined themes with full TypeScript support.

## Theme Architecture Overview

The theming system consists of the following components:

1. **ThemeContext**: Global state management for theme selection
2. **colors.ts**: Central color definitions for both light and dark themes
3. **useThemeColor Hook**: Utility hook for accessing theme colors
4. **Component Implementation**: How to use themes in components

### Directory Structure

```
/context
  ├── ThemeContext.tsx         # Theme state management
  └── __tests__/              
      └── ThemeContext-test.tsx # Tests for context provider
/hooks
  ├── useThemeColor.ts         # Theme color access hook
  └── __tests__/
      └── useThemeColor-test.ts # Tests for hook
/themes
  ├── colors.ts                # Color definitions
  └── __tests__/
      └── colors-test.ts       # Tests for color definitions
```

## Theme Context

Theme state is managed through React Context, which allows for app-wide theme switching and persistence.

```typescript
// Context definition in ThemeContext.tsx
export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isSystemTheme: boolean;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isSystemTheme: true,
});
```

### ThemeProvider

The `ThemeProvider` component wraps your application to provide theme state throughout the component tree:

```typescript
// In app/_layout.tsx
import { ThemeProvider } from '../context/ThemeContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack />
    </ThemeProvider>
  );
}
```

### Theme Persistence

The theme selection is automatically saved to `AsyncStorage` and restored on app start:

```typescript
// Simplified implementation from ThemeContext.tsx
const THEME_STORAGE_KEY = '@opencloud_theme';

useEffect(() => {
  const loadTheme = async () => {
    const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      setThemeState(savedTheme as ThemeMode);
    }
  };
  
  loadTheme();
}, []);

const setTheme = async (newTheme: ThemeMode) => {
  await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  setThemeState(newTheme);
};
```

## Color Definitions

Colors are defined in the `themes/colors.ts` file with parallel structures for light and dark themes:

```typescript
export const colors = {
  light: {
    // Base colors
    text: '#000000',
    background: '#FFFFFF',
    
    // UI Elements
    surface: '#FFFFFF',
    surfaceVariant: '#F7F9FC',
    border: '#E1E4E8',
    
    // Interactive elements
    primary: '#007AFF',
    // ... more colors
  },
  
  dark: {
    // Base colors
    text: '#FFFFFF',
    background: '#000000',
    
    // UI Elements
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    border: '#38383A',
    
    // Interactive elements
    primary: '#0A84FF',
    // ... more colors
  }
};
```

## Theme Hook: useThemeColor

The `useThemeColor` hook provides convenient access to theme colors:

```typescript
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const { theme } = useContext(ThemeContext);
  const systemTheme = useColorScheme() ?? 'light';
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  
  const colorFromProps = props[effectiveTheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[effectiveTheme][colorName];
  }
}
```

This hook performs several important functions:
1. Determines the effective theme (user selection or system default)
2. Handles custom color overrides passed through props
3. Falls back to theme defaults when no override is provided

## Using Themes in Components

### Basic Usage

To use the theming system in a component:

```typescript
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useColorScheme } from 'react-native';
import { colors } from '../themes/colors';

export default function MyComponent() {
  const { theme } = useContext(ThemeContext);
  const systemTheme = useColorScheme() ?? 'light';
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const themeColors = colors[effectiveTheme];
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>
        Hello, themed world!
      </Text>
    </View>
  );
}
```

### Dynamic Styling

For dynamic styling, use style arrays with theme-based overrides:

```typescript
<Text 
  style={[
    styles.buttonText, 
    { color: themeColors.primary },
    isDisabled ? { color: themeColors.buttonDisabledText } : null
  ]}
>
  Submit
</Text>
```

### Theme Switching UI

To implement a theme selection UI, access and update the theme state:

```typescript
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export function ThemeSelector() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <View>
      <TouchableOpacity onPress={() => setTheme('light')}>
        <Text>Light Theme {theme === 'light' && '✓'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setTheme('dark')}>
        <Text>Dark Theme {theme === 'dark' && '✓'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setTheme('system')}>
        <Text>System Theme {theme === 'system' && '✓'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Testing Theme-Related Code

The theme system includes comprehensive tests for all aspects:

### Testing ThemeContext

```typescript
// Example test from context/__tests__/ThemeContext-test.tsx
it('should load saved theme from AsyncStorage', async () => {
  // Mock AsyncStorage to return a saved theme
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

  const { result } = renderHook(() => useContext(ThemeContext), {
    wrapper: ThemeProvider,
  });

  // Wait for AsyncStorage to resolve
  await act(async () => {
    await Promise.resolve();
  });

  // Verify theme loaded from AsyncStorage
  expect(result.current.theme).toBe('dark');
});
```

### Testing the useThemeColor Hook

```typescript
// Example test from hooks/__tests__/useThemeColor-test.ts
it('should use system theme when theme is set to system', () => {
  // Setup system theme as dark
  (useColorScheme as jest.Mock).mockReturnValue('dark');
  (React.useContext as jest.Mock).mockReturnValue({ theme: 'system' });
  
  // Test
  const color = useThemeColor({ light: 'red', dark: 'blue' }, 'text');
  
  // Should use dark because system theme is dark
  expect(color).toBe('blue');
});
```

### Testing Color Definitions

```typescript
// Example test from themes/__tests__/colors-test.ts
it('should have matching keys in both light and dark themes', () => {
  const lightKeys = Object.keys(colors.light);
  const darkKeys = Object.keys(colors.dark);

  // Check that light theme has all dark theme keys
  darkKeys.forEach(key => {
    expect(lightKeys).toContain(key);
  });

  // Check that dark theme has all light theme keys
  lightKeys.forEach(key => {
    expect(darkKeys).toContain(key);
  });
});
```

## Best Practices

1. **Static Style Definitions**: Keep static style properties in StyleSheet objects:
   ```typescript
   const styles = StyleSheet.create({
     container: {
       flex: 1,
       padding: 20,
       // backgroundColor applied dynamically
     }
   });
   ```

2. **Dynamic Theme Properties**: Apply theme-specific properties through style arrays:
   ```typescript
   <View style={[styles.container, { backgroundColor: themeColors.background }]}>
   ```

3. **Adding New Colors**: When adding a new color to the theme:
   - Add it to both light and dark themes in `colors.ts`
   - Provide appropriate contrast for both themes
   - Document the color's purpose with comments

4. **Component Isolation**: Make components theme-aware rather than passing theme objects through props

5. **Responsive Design**: Consider how colors change with theme in your layout:
   ```typescript
   // Example of changing UI based on theme
   <StatusBar style={effectiveTheme === 'dark' ? "light" : "dark"} />
   ```