import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { ApiService, User, Drive, ApiError } from '../services/api/ApiService';
import { AuthService } from '../services/AuthService';
// Kept for future authentication enhancements (token renewal, advanced logout, auth info display)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authConfig } from '../config/app.config';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

export default function AccountScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      // Only set error to null if there wasn't one before
      if (error) setError(null);
      
      // Check if authenticated
      if (!ApiService.isAuthenticated()) {
        console.log('Not authenticated, redirecting to login');
        setError('Not authenticated');
        router.replace('/');
        return;
      }
      
      console.log('Loading account data from API...');
      
      try {
        // Try to use real API first (comment this out to use mock data)
        // ApiService.enableMockDataMode('mock-token', 'https://shniq.cloud');
        
        // Get user info first
        const userData = await ApiService.getCurrentUser();
        console.log('User data loaded successfully:', userData.displayName);
        setUser(userData);
        
        // Then get user drives
        const drivesResponse = await ApiService.getUserDrives();
        console.log('Drives loaded successfully:', drivesResponse.value?.length || 0);
        setDrives(drivesResponse.value || []);
        
        // Only set loading to false after successfully loading everything
        setLoading(false);
      } catch (error) {
        const apiError = error as ApiError;
        console.error('API request failed:', apiError);
        setLoading(false); // Stop loading even if there's an error
        
        // Extract request ID if available for debugging
        const requestId = apiError.requestId || 'unknown';
        
        // Set error message with debugging information
        setError(`Could not load account data. Please try again later.${__DEV__ ? `\n\nError: ${apiError.message}\nRequest ID: ${requestId}` : ''}`);
        
        // Alert only for development purposes
        if (__DEV__) {
          Alert.alert(
            'API Error (Dev Mode)',
            `Could not load data from server: ${apiError.message}\nRequest ID: ${requestId}`,
            [
              {
                text: 'Retry',
                onPress: () => loadData()
              },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: () => router.replace('/')
              }
            ]
          );
        }
      }
    } catch (err) {
      console.error('Error loading account data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load account data');
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  useEffect(() => {
    console.log("Account screen mounted - loading data");
    loadData();
    
    // We don't need fallback data anymore
    return () => {
      console.log("Account screen unmounting");
    };
    // loadData is intentionally excluded from deps to only load data on mount
    // and prevent unnecessary API requests. Manual refresh is available via pull-to-refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading account information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>Return to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>{user?.displayName}</Text>
          <Text style={styles.email}>{user?.mail}</Text>
          {user?.userType && (
            <View style={styles.userTypeTag}>
              <Text style={styles.userTypeText}>{user.userType}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Drives Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Your Spaces</Text>
        {drives.length === 0 ? (
          <Text style={styles.emptyText}>No spaces found</Text>
        ) : (
          drives.map((drive) => (
            <View key={drive.id} style={styles.driveItem}>
              <View style={styles.driveIconContainer}>
                <Text style={styles.driveIcon}>
                  {drive.driveType === 'personal' ? '👤' : 
                   drive.driveType === 'project' ? '👥' : 
                   drive.driveType === 'share' ? '🔗' : '📁'}
                </Text>
              </View>
              <View style={styles.driveInfo}>
                <Text style={styles.driveName}>{drive.name}</Text>
                {drive.description && (
                  <Text style={styles.driveDescription}>{drive.description}</Text>
                )}
                <Text style={styles.driveType}>{drive.driveType}</Text>
              </View>
              {drive.quota && (
                <View style={styles.quotaContainer}>
                  <View style={styles.quotaBar}>
                    <View 
                      style={[
                        styles.quotaUsed, 
                        { width: `${(drive.quota.used / drive.quota.total) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.quotaText}>
                    {formatBytes(drive.quota.used)} / {formatBytes(drive.quota.total)}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={async () => {
            // Simple confirmation dialog
            Alert.alert(
              "Log Out",
              "Are you sure you want to log out?",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Log Out",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      // Perform both local and server logout without showing a loading dialog
                      // since it happens quickly and we navigate away immediately
                      const { redirectUrl, status } = await AuthService.logout(true);
                      
                      // Navigate back to login screen
                      router.back();
                      
                      // If logout was completed and there's a redirect URL
                      if (redirectUrl && status >= 300 && status < 400) {
                        setTimeout(() => {
                          Alert.alert(
                            "Logout Complete",
                            "Would you like to view the server's logout confirmation page?",
                            [
                              {
                                text: "No",
                                style: "cancel"
                              },
                              {
                                text: "View Confirmation",
                                onPress: async () => {
                                  try {
                                    await WebBrowser.openBrowserAsync(redirectUrl);
                                    console.log('Server logout page viewed');
                                  } catch (error) {
                                    console.error('Error opening server logout page:', error);
                                  }
                                }
                              }
                            ]
                          );
                        }, 300);
                      } else {
                        // Simple confirmation if logout was successful without redirect
                        setTimeout(() => {
                          Alert.alert(
                            "Logout Complete",
                            "Your session has been ended successfully.",
                            [{ text: "OK" }]
                          );
                        }, 300);
                      }
                    } catch (error) {
                      console.error('Error during logout:', error);
                      // Navigate back if we haven't already
                      if (router.canGoBack()) {
                        router.back();
                      }
                    }
                  }
                }
              ]
            );
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Helper to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  userTypeTag: {
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    color: '#0069C0',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e4e8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
  driveItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  driveIconContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driveIcon: {
    fontSize: 24,
  },
  driveInfo: {
    marginLeft: 40,
    paddingLeft: 10,
  },
  driveName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  driveDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  driveType: {
    fontSize: 13,
    color: '#888',
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  quotaContainer: {
    marginTop: 8,
  },
  quotaBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  quotaUsed: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  quotaText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    textAlign: 'right',
  },
  actionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    marginVertical: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});