import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { AuthService } from "../services/AuthService";
import { ApiService } from "../services/api/ApiService";
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const [serverUrl, setServerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      console.log("Connecting to:", serverUrl);
      
      // Check if using demo mode
      if (serverUrl.toLowerCase() === 'demo' || serverUrl.toLowerCase() === 'demo mode') {
        console.log("Activating demo mode");
        
        // Set API credentials for mock mode and enable mock data
        ApiService.enableMockDataMode('mock-token', 'https://demo.opencloud.example');
        
        // Delay navigation slightly to ensure credentials are set
        setTimeout(() => {
          // Navigate to account screen in demo mode
          console.log('Demo mode active - Navigating to account screen');
          router.push('/account');
          setIsLoading(false);
        }, 100);
        
        return;
      }
      
      // Regular connection flow for non-demo mode
      try {
        // Check if using http:// (insecure)
        const { url: normalizedUrl, isInsecure } = AuthService.normalizeServerUrl(serverUrl);
        
        // If using http://, show confirmation
        if (isInsecure) {
          // We need to create a promise for the alert
          const continueWithInsecure = await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Warning: Insecure Connection!',
              'Using HTTP instead of HTTPS is insecure. Your data could be intercepted. Are you sure you want to continue?',
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
            // Open browser for auth and handle the result directly
            try {
              // Real authentication flow
              console.log("Starting OIDC authentication flow");
              const result = await WebBrowser.openAuthSessionAsync(
                authUrl, 
                Platform.OS === 'ios' ? 'oc://ios.opencloud.eu' : 'oc://android.opencloud.eu'
              );
              
              console.log("WebBrowser auth result:", result.type);
              
              // Handle various WebBrowser result types
              if (result.type === 'success') {
                console.log("WebBrowser success - checking authentication status");
                console.log("Result URL:", result.url);
                // Try one more time to manually process the URL
                if (result.url && result.url.includes('code=')) {
                  console.log("Manual code extraction from result URL");
                  try {
                    // Extract code from URL
                    const matches = result.url.match(/code=([^&]+)/);
                    if (matches && matches.length > 1) {
                      const code = matches[1];
                      console.log("Manually extracted code, exchanging for tokens");
                      
                      // Exchange code for tokens
                      await AuthService.exchangeCodeForTokens(code);
                      
                      if (ApiService.isAuthenticated()) {
                        console.log("Successfully authenticated via manual URL processing");
                        router.push('/account');
                        return;
                      }
                    }
                  } catch (error) {
                    console.error("Error in manual URL processing:", error);
                  }
                }
                
                // If we get here, check if URL handler already processed this
                if (ApiService.isAuthenticated()) {
                  console.log("Successfully authenticated via URL handler");
                  router.push('/account');
                } else {
                  console.log("WebBrowser success but not authenticated yet");
                  // Show a message if not authenticated despite success
                  Alert.alert("Authentication Issue", "Browser returned success but authentication failed. Please try again.");
                }
              } else if (result.type === 'cancel') {
                console.log("Authentication cancelled by user");
              } else if (result.type === 'dismiss') {
                console.log("WebBrowser dismissed, checking authentication status");
                
                // Short delay to let URL handler finish if it's still processing
                setTimeout(() => {
                  if (ApiService.isAuthenticated()) {
                    console.log("Authenticated after dismiss, navigating to account screen");
                    router.push('/account');
                  } else {
                    console.log("Not authenticated after dismiss");
                    Alert.alert("Authentication Issue", 
                      "The authentication browser was closed but authentication was not completed. Please try again.",
                      [
                        {
                          text: "Try Again", 
                          onPress: () => handleConnect()
                        },
                        {
                          text: "Cancel",
                          style: "cancel"
                        }
                      ]
                    );
                  }
                }, 500);
              }
            } catch (authError) {
              console.error("Auth browser error:", authError);
              Alert.alert("Authentication Error", "Failed to open authentication browser: " + authError.message);
            }
          } else {
            Alert.alert('Error', 'Failed to generate authorization URL');
          }
        } else {
          Alert.alert('Error', 'Failed to discover OpenID Connect configuration');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        Alert.alert(
          'Authentication Error', 
          `Failed to connect to server: ${error.message || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Connect function error:', error);
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
      
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>OpenCloud</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Connect to your server</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="https://your-server.com or 'demo'"
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            editable={!isLoading}
            onSubmitEditing={serverUrl ? handleConnect : undefined}
            returnKeyType="go"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
