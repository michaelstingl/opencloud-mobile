import { useState, useContext } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { useColorScheme } from "react-native";
import { colors } from "../themes/colors";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { AuthService } from "../services/AuthService";
import { ApiService } from "../services/api/ApiService";
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const { theme } = useContext(ThemeContext);
  const systemTheme = useColorScheme() ?? 'light';
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const themeColors = colors[effectiveTheme];
  
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
      style={[styles.container, { backgroundColor: themeColors.background }]} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={effectiveTheme === 'dark' ? "light" : "dark"} />
      
      <View style={[styles.header, { 
        backgroundColor: themeColors.surface, 
        borderBottomColor: themeColors.border 
      }]}>
        <View style={{ width: 40 }} />
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>OpenCloud</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color={themeColors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text }]}>Welcome</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Connect to your server</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { 
              borderColor: themeColors.border,
              color: themeColors.text,
              backgroundColor: themeColors.surface
            }]}
            placeholder="https://your-server.com or 'demo'"
            placeholderTextColor={themeColors.textDisabled}
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
              { backgroundColor: themeColors.primary },
              !serverUrl ? { backgroundColor: themeColors.buttonDisabledBackground } : null,
              isLoading ? { backgroundColor: themeColors.primaryVariant } : null
            ]} 
            onPress={handleConnect}
            disabled={!serverUrl || isLoading}
          >
            <Text style={[
              styles.buttonText, 
              { color: themeColors.surface },
              !serverUrl ? { color: themeColors.buttonDisabledText } : null
            ]}>
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
    // backgroundColor applied dynamically
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    // backgroundColor and borderBottomColor applied dynamically
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    // color applied dynamically
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
    // color applied dynamically
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    // color applied dynamically
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    height: 50,
    borderWidth: 1,
    // borderColor, color, backgroundColor applied dynamically
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    // backgroundColor applied dynamically
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  // buttonDisabled and buttonLoading styles applied dynamically
  buttonText: {
    // color applied dynamically
    fontSize: 16,
    fontWeight: "bold",
  },
});
