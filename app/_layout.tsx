import { Stack } from "expo-router";
import { useEffect } from "react";
// Platform is needed for platform-specific redirect URIs and User-Agent in the app configuration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Linking, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { AuthService } from "../services/AuthService";
import { ApiService } from "../services/api/ApiService";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  useEffect(() => {
    console.log("========== ROOT LAYOUT MOUNT ==========");
    console.log(`App running in ${__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
    console.log("Setting up URL handling for auth callbacks");
    
    // Handle deep linking for auth callback
    const handleOpenURL = async (event: { url: string }) => {
      console.log("========================");
      console.log("DEEP LINK RECEIVED:", event.url);
      console.log("========================");
      
      // Check for any type of authentication callback
      // Try several patterns to catch all possible variations
      if (
        event.url.includes("oc://") ||
        event.url.includes("opencloudmobile://") ||
        event.url.includes("auth/callback") ||
        event.url.includes("code=")
      ) {
        console.log("=== AUTH CALLBACK DETECTED ===");
        
        // Try to extract the authorization code in multiple ways
        let code = null;
        let extractionMethod = "";
        
        // Method 1: Full URL parsing
        try {
          const urlObj = new URL(event.url);
          code = urlObj.searchParams.get('code');
          if (code) {
            extractionMethod = "URL object";
            console.log("Code extracted with URL object");
          }
        } catch (error) {
          console.error("Error parsing with URL object:", error);
        }
        
        // Method 2: Simple URL search params
        if (!code && event.url.includes("?")) {
          try {
            const urlParams = new URLSearchParams(event.url.split('?')[1]);
            code = urlParams.get('code');
            if (code) {
              extractionMethod = "URL search params";
              console.log("Code extracted with URL search params");
            }
          } catch (error) {
            console.error("Error parsing URL search params:", error);
          }
        }
        
        // Method 3: Basic regex
        if (!code && event.url.includes("code=")) {
          try {
            const matches = event.url.match(/code=([^&]+)/);
            if (matches && matches.length > 1) {
              code = matches[1];
              extractionMethod = "regex";
              console.log("Code extracted with regex");
            }
          } catch (error) {
            console.error("Error extracting code with regex:", error);
          }
        }
        
        // Method 4: Manual string splitting
        if (!code && event.url.includes("code=")) {
          try {
            const parts = event.url.split("code=");
            if (parts.length > 1) {
              const codePart = parts[1].split("&")[0];
              if (codePart) {
                code = codePart;
                extractionMethod = "string splitting";
                console.log("Code extracted with string splitting");
              }
            }
          } catch (error) {
            console.error("Error with string splitting:", error);
          }
        }
        
        console.log("Extraction success:", !!code);
        console.log("Extraction method:", extractionMethod);
        
        // Now try to exchange the code if we have it
        if (code) {
          console.log("CODE FOUND - attempting to exchange for tokens...");
          
          try {
            // Exchange the code for tokens
            await AuthService.exchangeCodeForTokens(code);
            
            // Check if authentication worked
            const isAuthenticated = ApiService.isAuthenticated();
            console.log("Authentication status after token exchange:", isAuthenticated);
            
            if (isAuthenticated) {
              console.log("SUCCESS - Authenticated via deep link!");
              console.log("Will navigate to account screen after delay...");
              
              // Add a delay to ensure tokens are processed
              setTimeout(() => {
                console.log("Attempting to navigate to /account now");
                router.push('/account');
              }, 300);
            } else {
              console.error("FAILURE - Authentication failed after code exchange!");
              Alert.alert(
                "Authentication Failed",
                "Failed to authenticate with the server. Please try again."
              );
            }
          } catch (error) {
            console.error("ERROR during token exchange:", error);
            Alert.alert(
              "Authentication Error",
              `Token exchange failed: ${error.message}`
            );
          }
        } else {
          console.error("NO CODE FOUND in URL:", event.url);
          Alert.alert(
            "Authentication Error",
            "No authorization code found in the callback URL"
          );
        }
      } else {
        console.log("Not an auth callback URL");
      }
    };

    // Add event listener for deep links
    const subscription = Linking.addEventListener('url', handleOpenURL);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        handleOpenURL({ url: initialUrl });
      }
    });

    return () => {
      // Remove the event listener on cleanup
      subscription.remove();
    };
  }, []);

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ 
          headerShown: false,
          presentation: 'modal'
        }} />
        <Stack.Screen name="account" options={{ 
          title: "Your Account",
          headerBackVisible: false,
          gestureEnabled: false
        }} />
        <Stack.Screen name="test" options={{ 
          title: "Test Screen"
        }} />
      </Stack>
    </ThemeProvider>
  );
}
