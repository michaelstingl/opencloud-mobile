import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ApiService } from "../services/api/ApiService";

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Screen</Text>
      <Text style={styles.description}>Navigation works! You can now proceed to the account screen or go back home.</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.accountButton]}
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
        <Text style={styles.buttonText}>Go to Account Screen</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.homeButton]}
        onPress={() => {
          console.log("Navigating back to home");
          // Use back() for proper back animation instead of replace()
          router.back();
        }}
      >
        <Text style={styles.buttonText}>Go Back to Home</Text>
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
    backgroundColor: '#f7f9fc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#555',
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 220,
    alignItems: 'center',
  },
  accountButton: {
    backgroundColor: '#007AFF',
  },
  homeButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});