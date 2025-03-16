import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useContext } from 'react';
import { router } from 'expo-router';
import { ApiService } from "../services/api/ApiService";
import { ThemeContext } from '../context/ThemeContext';
import { useColorScheme } from 'react-native';
import { colors } from '../themes/colors';

export default function TestScreen() {
  const { theme } = useContext(ThemeContext);
  const systemTheme = useColorScheme() ?? 'light';
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const themeColors = colors[effectiveTheme];
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.surfaceVariant }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Test Screen</Text>
      <Text style={[styles.description, { color: themeColors.textSecondary }]}>
        Navigation works! You can now proceed to the account screen or go back home.
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: themeColors.primary }]}
        onPress={() => {
          console.log("Navigating to account screen from test screen");
          try {
            // Set mock credentials for testing
            ApiService.enableMockDataMode('mock-token', 'https://demo.opencloud.example');
            
            // Try to navigate
            router.push('/account');
          } catch (error) {
            console.error("Navigation error:", error);
            Alert.alert("Navigation Error", JSON.stringify(error));
          }
        }}
      >
        <Text style={[styles.buttonText, { color: themeColors.surface }]}>Go to Account Screen</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: themeColors.textSecondary }]}
        onPress={() => {
          console.log("Navigating back to home");
          // Use back() for proper back animation instead of replace()
          router.back();
        }}
      >
        <Text style={[styles.buttonText, { color: themeColors.surface }]}>Go Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // backgroundColor applied dynamically
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    // color applied dynamically
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    // color applied dynamically
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 220,
    alignItems: 'center',
    // backgroundColor applied dynamically
  },
  buttonText: {
    // color applied dynamically
    fontSize: 16,
    fontWeight: '600',
  },
});