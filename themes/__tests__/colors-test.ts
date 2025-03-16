import { colors } from '../colors';

describe('Theme Colors', () => {
  describe('Light Theme', () => {
    const lightColors = colors.light;

    it('should have a complete set of base colors', () => {
      expect(lightColors.text).toBeDefined();
      expect(lightColors.background).toBeDefined();
      expect(lightColors.tint).toBeDefined();
    });

    it('should have UI element colors', () => {
      expect(lightColors.surface).toBeDefined();
      expect(lightColors.surfaceVariant).toBeDefined();
      expect(lightColors.border).toBeDefined();
      expect(lightColors.borderLight).toBeDefined();
    });

    it('should have status colors', () => {
      expect(lightColors.success).toBeDefined();
      expect(lightColors.warning).toBeDefined();
      expect(lightColors.error).toBeDefined();
      expect(lightColors.info).toBeDefined();
    });

    it('should have text variants', () => {
      expect(lightColors.textSecondary).toBeDefined();
      expect(lightColors.textDisabled).toBeDefined();
      expect(lightColors.textLink).toBeDefined();
    });

    it('should have button variants', () => {
      expect(lightColors.buttonBackground).toBeDefined();
      expect(lightColors.buttonDisabledBackground).toBeDefined();
      expect(lightColors.buttonDisabledText).toBeDefined();
      expect(lightColors.buttonBorder).toBeDefined();
    });

    it('should have consistent color patterns', () => {
      // Check for expected iOS-like light mode colors
      expect(lightColors.primary).toBe('#007AFF'); // iOS blue
      expect(lightColors.background).toBe('#FFFFFF'); // White background
      expect(lightColors.text).toBe('#000000'); // Black text
    });
  });

  describe('Dark Theme', () => {
    const darkColors = colors.dark;

    it('should have a complete set of base colors', () => {
      expect(darkColors.text).toBeDefined();
      expect(darkColors.background).toBeDefined();
      expect(darkColors.tint).toBeDefined();
    });

    it('should have inversed text/background colors compared to light theme', () => {
      expect(darkColors.text).toBe('#FFFFFF'); // White text
      expect(darkColors.background).toBe('#000000'); // Black background
      expect(darkColors.text).not.toBe(colors.light.text); // Different from light theme
      expect(darkColors.background).not.toBe(colors.light.background); // Different from light theme
    });

    it('should have darker UI element colors', () => {
      // Dark theme surfaces should be darker variants
      expect(darkColors.surface).toBe('#1C1C1E'); // iOS dark mode card color
      expect(darkColors.surface).not.toBe(colors.light.surface); // Different from light theme
    });

    it('should have appropriate colors for disabled states', () => {
      expect(darkColors.buttonDisabledBackground).toBeDefined();
      expect(darkColors.buttonDisabledText).toBeDefined();
      expect(darkColors.buttonDisabledText).toBe('#8E8E93'); // Should be visible on dark backgrounds
    });
  });

  describe('Theme Structure', () => {
    it('should have matching keys in both light and dark themes', () => {
      // Get all keys from both themes
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

      // They should have exactly the same number of keys
      expect(lightKeys.length).toBe(darkKeys.length);
    });

    it('should have all color values as hex codes', () => {
      // Check light theme
      Object.values(colors.light).forEach(value => {
        expect(typeof value).toBe('string');
        expect(value).toMatch(/^#[0-9A-F]{6}$/i);
      });

      // Check dark theme
      Object.values(colors.dark).forEach(value => {
        expect(typeof value).toBe('string');
        expect(value).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });
});