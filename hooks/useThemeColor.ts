import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext, ThemeMode } from '../context/ThemeContext';
import { colors } from '../themes/colors';

export type ColorName = keyof typeof colors.light & keyof typeof colors.dark;

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

// Export the colors for direct access when needed
export { colors };