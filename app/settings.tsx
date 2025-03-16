import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { ThemeContext } from '../context/ThemeContext';
import { useColorScheme } from 'react-native';
import { colors } from '../themes/colors';

export default function SettingsScreen() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [autoSync, setAutoSync] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  const [wifiOnly, setWifiOnly] = React.useState(false);
  const [debugMode, setDebugMode] = React.useState(false);
  
  // Get system theme for display purposes
  const systemTheme = useColorScheme() ?? 'light';
  
  // Get current theme colors
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const themeColors = colors[effectiveTheme];

  // App version info - Get from package.json via import
  const appVersion = require('../package.json').version;
  const buildNumber = Constants.expoConfig?.extra?.buildNumber || "1";
  const expoSdkVersion = Constants.expoConfig?.sdkVersion || "52.0.37";
  const reactNativeVersion = "0.76.7";

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
    <ScrollView style={[styles.container, { backgroundColor: themeColors.surfaceVariant }]}>
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Settings</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.headerButton, { color: themeColors.primary }]}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Appearance</Text>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]} 
          onPress={() => setTheme('light')}
        >
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>Light</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {theme === 'light' && (
              <Text style={{ marginRight: 8, color: themeColors.primary }}>✓</Text>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]} 
          onPress={() => setTheme('dark')}
        >
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>Dark</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {theme === 'dark' && (
              <Text style={{ marginRight: 8, color: themeColors.primary }}>✓</Text>
            )}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]} 
          onPress={() => setTheme('system')}
        >
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>System ({systemTheme})</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {theme === 'system' && (
              <Text style={{ marginRight: 8, color: themeColors.primary }}>✓</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Synchronization</Text>
        <View style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>Auto Sync</Text>
          <View style={styles.disabledSwitchContainer}>
            <Switch
              trackColor={{ false: themeColors.switchTrackOff, true: themeColors.switchTrackOn }}
              thumbColor={autoSync ? themeColors.switchThumbOn : themeColors.switchThumbOff}
              ios_backgroundColor={themeColors.switchIOSBackground}
              onValueChange={toggleAutoSync}
              value={autoSync}
              disabled={true}
            />
            <Text style={[styles.comingSoonBadge, { 
              color: themeColors.badgeText,
              backgroundColor: themeColors.badgeBackground
            }]}>Coming Soon</Text>
          </View>
        </View>
        <View style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>WiFi Only</Text>
          <View style={styles.disabledSwitchContainer}>
            <Switch
              trackColor={{ false: themeColors.switchTrackOff, true: themeColors.switchTrackOn }}
              thumbColor={wifiOnly ? themeColors.switchThumbOn : themeColors.switchThumbOff}
              ios_backgroundColor={themeColors.switchIOSBackground}
              onValueChange={toggleWifiOnly}
              value={wifiOnly}
              disabled={true}
            />
            <Text style={[styles.comingSoonBadge, { 
              color: themeColors.badgeText,
              backgroundColor: themeColors.badgeBackground
            }]}>Coming Soon</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Notifications</Text>
        <View style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>Enable Notifications</Text>
          <View style={styles.disabledSwitchContainer}>
            <Switch
              trackColor={{ false: themeColors.switchTrackOff, true: themeColors.switchTrackOn }}
              thumbColor={notifications ? themeColors.switchThumbOn : themeColors.switchThumbOff}
              ios_backgroundColor={themeColors.switchIOSBackground}
              onValueChange={toggleNotifications}
              value={notifications}
              disabled={true}
            />
            <Text style={[styles.comingSoonBadge, { 
              color: themeColors.badgeText,
              backgroundColor: themeColors.badgeBackground
            }]}>Coming Soon</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Advanced</Text>
        <View style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>Debug Mode</Text>
          <View style={styles.disabledSwitchContainer}>
            <Switch
              trackColor={{ false: themeColors.switchTrackOff, true: themeColors.switchTrackOn }}
              thumbColor={debugMode ? themeColors.switchThumbOn : themeColors.switchThumbOff}
              ios_backgroundColor={themeColors.switchIOSBackground}
              onValueChange={toggleDebugMode}
              value={debugMode}
              disabled={true}
            />
            <Text style={[styles.comingSoonBadge, { 
              color: themeColors.badgeText,
              backgroundColor: themeColors.badgeBackground
            }]}>Coming Soon</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <TouchableOpacity 
          style={[styles.button, { 
            backgroundColor: themeColors.buttonDisabledBackground,
            borderWidth: 1,
            borderColor: themeColors.buttonBorder
          }]}
          disabled={true}
        >
          <Text style={[styles.buttonText, { color: themeColors.buttonDisabledText }]}>Clear Cache</Text>
          <Text style={[styles.comingSoonButtonBadge, { color: themeColors.badgeText }]}>Coming Soon</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { 
            backgroundColor: themeColors.buttonDisabledBackground,
            borderWidth: 1,
            borderColor: themeColors.buttonBorder
          }]}
          disabled={true}
        >
          <Text style={[styles.buttonText, { color: themeColors.buttonDisabledText }]}>Reset Application</Text>
          <Text style={[styles.comingSoonButtonBadge, { color: themeColors.badgeText }]}>Coming Soon</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>About</Text>
        
        <View style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>Version</Text>
          <Text style={[styles.settingValue, { color: themeColors.textSecondary }]}>{appVersion} (Build {buildNumber})</Text>
        </View>
        
        <View style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>Expo SDK</Text>
          <Text style={[styles.settingValue, { color: themeColors.textSecondary }]}>{expoSdkVersion}</Text>
        </View>
        
        <View style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>React Native</Text>
          <Text style={[styles.settingValue, { color: themeColors.textSecondary }]}>{reactNativeVersion}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]}
          onPress={() => openUrl("https://github.com/michaelstingl/opencloud-mobile")}
        >
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>Source Code</Text>
          <Text style={[styles.settingValue, { color: themeColors.textLink }]}>GitHub</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: themeColors.borderLight }]}
          onPress={() => openUrl("https://github.com/michaelstingl/opencloud-mobile/issues")}
        >
          <Text style={[styles.settingLabel, { color: themeColors.text }]}>Report an Issue</Text>
          <Text style={[styles.settingValue, { color: themeColors.textLink }]}>GitHub Issues</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Acknowledgments</Text>
        
        <View style={[styles.acknowledgmentItem, { borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.acknowledgmentTitle, { color: themeColors.text }]}>OpenCloud Project</Text>
          <Text style={[styles.acknowledgmentText, { color: themeColors.textSecondary }]}>
            This app is designed to work with OpenCloud servers.
          </Text>
        </View>
        
        <View style={[styles.acknowledgmentItem, { borderBottomColor: themeColors.borderLight }]}>
          <Text style={[styles.acknowledgmentTitle, { color: themeColors.text }]}>Open Source Libraries</Text>
          <Text style={[styles.acknowledgmentText, { color: themeColors.textSecondary }]}>
            This app uses several open source libraries including React Native, Expo, 
            and others. We're grateful to the open source community for making this app possible.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: themeColors.buttonBackground }]}
          onPress={() => openUrl("https://github.com/michaelstingl/opencloud-mobile/blob/main/LICENSE")}
        >
          <Text style={[styles.buttonText, { color: themeColors.primary }]}>View License</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    // backgroundColor and borderBottomColor applied dynamically
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    // color applied dynamically
  },
  headerButton: {
    fontSize: 17,
    // color applied dynamically
  },
  section: {
    // backgroundColor and borderColor applied dynamically
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    // color applied dynamically
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
    // borderBottomColor applied dynamically
  },
  settingLabel: {
    fontSize: 16,
    // color applied dynamically
  },
  settingValue: {
    fontSize: 16,
    // color applied dynamically
  },
  button: {
    margin: 15,
    padding: 15,
    // backgroundColor applied dynamically
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  buttonText: {
    fontSize: 16,
    // color applied dynamically
  },
  disabledSwitchContainer: {
    alignItems: 'center',
  },
  comingSoonBadge: {
    fontSize: 10,
    // color and backgroundColor applied dynamically
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  comingSoonButtonBadge: {
    fontSize: 10,
    // color applied dynamically
    position: 'absolute',
    bottom: 3,
    right: 10,
  },
  acknowledgmentItem: {
    padding: 15,
    borderBottomWidth: 1,
    // borderBottomColor applied dynamically
  },
  acknowledgmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    // color applied dynamically
  },
  acknowledgmentText: {
    fontSize: 14,
    // color applied dynamically
    lineHeight: 20,
  },
});