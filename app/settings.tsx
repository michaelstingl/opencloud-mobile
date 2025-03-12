import React from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [autoSync, setAutoSync] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  const [wifiOnly, setWifiOnly] = React.useState(false);
  const [debugMode, setDebugMode] = React.useState(false);

  // App version info - Get from package.json via import
  const appVersion = require('../package.json').version;
  const buildNumber = Constants.expoConfig?.extra?.buildNumber || "1";
  const expoSdkVersion = Constants.expoConfig?.sdkVersion || "52.0.37";
  const reactNativeVersion = "0.76.7";

  const toggleDarkMode = () => setDarkMode(previousState => !previousState);
  const toggleAutoSync = () => setAutoSync(previousState => !previousState);
  const toggleNotifications = () => setNotifications(previousState => !previousState);
  const toggleWifiOnly = () => setWifiOnly(previousState => !previousState);
  const toggleDebugMode = () => setDebugMode(previousState => !previousState);
  
  const openUrl = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    });
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerButton}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <View style={styles.disabledSwitchContainer}>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={darkMode ? "#007AFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleDarkMode}
              value={darkMode}
              disabled={true}
            />
            <Text style={styles.comingSoonBadge}>Coming Soon</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Synchronization</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Auto Sync</Text>
          <View style={styles.disabledSwitchContainer}>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={autoSync ? "#007AFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleAutoSync}
              value={autoSync}
              disabled={true}
            />
            <Text style={styles.comingSoonBadge}>Coming Soon</Text>
          </View>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>WiFi Only</Text>
          <View style={styles.disabledSwitchContainer}>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={wifiOnly ? "#007AFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleWifiOnly}
              value={wifiOnly}
              disabled={true}
            />
            <Text style={styles.comingSoonBadge}>Coming Soon</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <View style={styles.disabledSwitchContainer}>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notifications ? "#007AFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleNotifications}
              value={notifications}
              disabled={true}
            />
            <Text style={styles.comingSoonBadge}>Coming Soon</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Debug Mode</Text>
          <View style={styles.disabledSwitchContainer}>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={debugMode ? "#007AFF" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleDebugMode}
              value={debugMode}
              disabled={true}
            />
            <Text style={styles.comingSoonBadge}>Coming Soon</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonDisabled]}
          disabled={true}
        >
          <Text style={[styles.buttonText, styles.buttonTextDisabled]}>Clear Cache</Text>
          <Text style={styles.comingSoonButtonBadge}>Coming Soon</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.buttonDisabled]}
          disabled={true}
        >
          <Text style={[styles.buttonText, styles.buttonTextDisabled]}>Reset Application</Text>
          <Text style={styles.comingSoonButtonBadge}>Coming Soon</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>{appVersion} (Build {buildNumber})</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Expo SDK</Text>
          <Text style={styles.settingValue}>{expoSdkVersion}</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>React Native</Text>
          <Text style={styles.settingValue}>{reactNativeVersion}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => openUrl("https://github.com/michaelstingl/opencloud-mobile")}
        >
          <Text style={styles.settingLabel}>Source Code</Text>
          <Text style={[styles.settingValue, styles.linkText]}>GitHub</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => openUrl("https://github.com/michaelstingl/opencloud-mobile/issues")}
        >
          <Text style={styles.settingLabel}>Report an Issue</Text>
          <Text style={[styles.settingValue, styles.linkText]}>GitHub Issues</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acknowledgments</Text>
        
        <View style={styles.acknowledgmentItem}>
          <Text style={styles.acknowledgmentTitle}>OpenCloud Project</Text>
          <Text style={styles.acknowledgmentText}>
            This app is designed to work with OpenCloud servers.
          </Text>
        </View>
        
        <View style={styles.acknowledgmentItem}>
          <Text style={styles.acknowledgmentTitle}>Open Source Libraries</Text>
          <Text style={styles.acknowledgmentText}>
            This app uses several open source libraries including React Native, Expo, 
            and others. We're grateful to the open source community for making this app possible.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => openUrl("https://github.com/michaelstingl/opencloud-mobile/blob/main/LICENSE")}
        >
          <Text style={styles.buttonText}>View License</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e4e8',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777',
    paddingHorizontal: 15,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    color: '#777',
  },
  linkText: {
    color: '#007AFF',
  },
  button: {
    margin: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  buttonDisabled: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  buttonTextDisabled: {
    color: '#a0a0a0',
  },
  disabledSwitchContainer: {
    alignItems: 'center',
  },
  comingSoonBadge: {
    fontSize: 10,
    color: '#888',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  comingSoonButtonBadge: {
    fontSize: 10,
    color: '#888',
    position: 'absolute',
    bottom: 3,
    right: 10,
  },
  acknowledgmentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  acknowledgmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  acknowledgmentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});