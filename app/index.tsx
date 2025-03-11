import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthService } from "../services/AuthService";
import * as WebBrowser from 'expo-web-browser';

export default function Index() {
  const [serverUrl, setServerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      console.log("Connecting to:", serverUrl);
      
      // Check if using http:// (insecure)
      const { url: normalizedUrl, isInsecure } = AuthService.normalizeServerUrl(serverUrl);
      
      // If using http://, show confirmation
      if (isInsecure) {
        // We need to create a promise for the alert
        const continueWithInsecure = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Warning: Insecure Connection!',
            'Using HTTP instead of HTTPS is insecure. Your data could be intercepted. Are you sure you want to continue with an insecure connection?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resolve(false)
              },
              {
                text: 'Continue Anyway',
                style: 'destructive',
                onPress: () => resolve(true)
              }
            ],
            { cancelable: false }
          );
        });
        
        // If user canceled, stop the connection process
        if (!continueWithInsecure) {
          setIsLoading(false);
          return;
        }
      }
      
      // Initialize authentication service
      const { success } = await AuthService.initialize(normalizedUrl);
      
      if (success) {
        // Get authorization URL
        const authUrl = AuthService.getAuthorizationUrl();
        
        if (authUrl) {
          // Open browser for auth
          await WebBrowser.openAuthSessionAsync(authUrl, 'opencloudmobile://auth/callback');
        } else {
          Alert.alert('Error', 'Failed to generate authorization URL');
        }
      } else {
        Alert.alert('Error', 'Failed to discover OpenID Connect configuration');
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection Error', error.message || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="auto" />
      
      <View style={styles.content}>
        <Text style={styles.title}>OpenCloud</Text>
        <Text style={styles.subtitle}>Connect to your server</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="https://your-server.com"
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={[
              styles.button, 
              !serverUrl ? styles.buttonDisabled : null,
              isLoading ? styles.buttonLoading : null
            ]} 
            onPress={handleConnect}
            disabled={!serverUrl || isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Connecting...' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonLoading: {
    backgroundColor: "#4aa3ff",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
