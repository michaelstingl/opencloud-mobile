import { useThemeColor } from '../useThemeColor';
import { useColorScheme } from 'react-native';

// Mock React Native's useColorScheme
jest.mock('react-native', () => ({
  useColorScheme: jest.fn()
}));

describe('useThemeColor', () => {
  it('should return the light color when theme is light', () => {
    // Setup
    (useColorScheme as jest.Mock).mockReturnValue('light');
    
    // Test
    const color = useThemeColor({ light: 'red', dark: 'blue' }, 'text');
    
    // Assert
    expect(color).toBe('red');
  });
  
  it('should return the dark color when theme is dark', () => {
    // Setup
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    
    // Test
    const color = useThemeColor({ light: 'red', dark: 'blue' }, 'text');
    
    // Assert
    expect(color).toBe('blue');
  });
  
  it('should use default colors when props dont specify color', () => {
    // Setup
    (useColorScheme as jest.Mock).mockReturnValue('light');
    
    // Test with no color props
    const color = useThemeColor({}, 'text');
    
    // Assert
    expect(color).toBe('#000');
  });
});