import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import {
  getOAuthConfig,
  disconnectGmail,
  isGmailConnected,
} from '@/services/gmailOAuthService';
import { supabase } from '@/services/supabase';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomCard } from '@/components/ui/CustomCard';
import { colors, lightColors } from '@/constants/theme';

export const EmailConnectionScreen = () => {
  const navigation = useNavigation();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check connection status on mount and set up polling
  useEffect(() => {
    checkConnectionStatus();
    
    // Poll every 2 seconds when processing to detect when user completes OAuth
    let interval: NodeJS.Timeout | null = null;
    if (isProcessing) {
      interval = setInterval(checkConnectionStatus, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing]);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const connected = await isGmailConnected();
      
      if (connected && isProcessing) {
        // User just completed OAuth in web browser
        setIsProcessing(false);
        const config = await getOAuthConfig();
        setConnectedEmail(config?.email_address || null);
        Alert.alert(
          'Success!',
          `Gmail account ${config?.email_address || ''} has been connected. Your transaction emails will now be automatically detected.`,
          [{ text: 'OK' }]
        );
      }
      
      setIsConnected(connected);

      if (connected && !isProcessing) {
        const config = await getOAuthConfig();
        setConnectedEmail(config?.email_address || null);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsProcessing(true);
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Open OAuth web page with user ID
      const oauthWebUrl = process.env.EXPO_PUBLIC_OAUTH_WEB_URL || 'http://localhost:3000';
      const url = `${oauthWebUrl}?userId=${user.id}`;
      
      console.log('Opening OAuth URL:', url);
      
      // Open in external browser
      await WebBrowser.openBrowserAsync(url);
      
      // Note: We'll poll for connection status to detect when user completes OAuth
      
    } catch (error) {
      console.error('Error opening OAuth:', error);
      Alert.alert('Error', 'Failed to open authentication page. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Gmail',
      'Are you sure you want to disconnect your Gmail account? You will no longer receive automatic transaction notifications.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await disconnectGmail();
              setIsConnected(false);
              setConnectedEmail(null);
              Alert.alert('Disconnected', 'Gmail account has been disconnected.');
            } catch (error) {
              console.error('Error disconnecting:', error);
              Alert.alert('Error', 'Failed to disconnect Gmail account.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CustomCard style={styles.card}>
        <Text style={styles.title}>📧 Email Integration</Text>
        <Text style={styles.description}>
          Connect your Gmail account to automatically detect transaction emails
          and create pending transactions for your review.
        </Text>

        {isConnected && connectedEmail ? (
          <View style={styles.connectedSection}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ Connected</Text>
            </View>
            <Text style={styles.emailText}>{connectedEmail}</Text>
            <Text style={styles.infoText}>
              Transaction emails will be automatically detected and added to
              your pending transactions.
            </Text>
          </View>
        ) : (
          <View style={styles.notConnectedSection}>
            <Text style={styles.infoText}>
              No Gmail account connected. Connect your account to enable
              automatic transaction detection.
            </Text>
          </View>
        )}
      </CustomCard>

      <CustomCard style={styles.card}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>
            1️⃣ Connect your Gmail account securely using Google OAuth
          </Text>
          <Text style={styles.stepText}>
            2️⃣ We scan for transaction-related emails (bank notifications, payment confirmations, etc.)
          </Text>
          <Text style={styles.stepText}>
            3️⃣ AI extracts transaction details (amount, merchant, date)
          </Text>
          <Text style={styles.stepText}>
            4️⃣ Review and approve pending transactions in the app
          </Text>
        </View>
      </CustomCard>

      <CustomCard style={styles.card}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <Text style={styles.securityText}>
          🔒 We only request read-only access to your Gmail
        </Text>
        <Text style={styles.securityText}>
          🔒 Only transaction-related emails are processed
        </Text>
        <Text style={styles.securityText}>
          🔒 Your emails are never stored, only transaction data
        </Text>
        <Text style={styles.securityText}>
          🔒 You can disconnect at any time
        </Text>
      </CustomCard>

      <View style={styles.buttonContainer}>
        {isConnected ? (
          <CustomButton
            onPress={handleDisconnect}
            variant="outline"
            disabled={isProcessing}
          >
            {isProcessing ? 'Disconnecting...' : 'Disconnect Gmail'}
          </CustomButton>
        ) : (
          <CustomButton
            onPress={handleConnect}
            disabled={isProcessing}
          >
            {isProcessing ? 'Connecting...' : 'Connect Gmail'}
          </CustomButton>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightColors.background.primary,
  },
  card: {
    marginBottom: 16,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightColors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: lightColors.text.secondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  connectedSection: {
    backgroundColor: colors.success[50],
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success[100],
  },
  notConnectedSection: {
    backgroundColor: colors.warning[50],
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning[100],
  },
  statusBadge: {
    backgroundColor: colors.success[500],
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: lightColors.text.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text.primary,
    marginBottom: 16,
  },
  stepContainer: {
    gap: 12,
  },
  stepText: {
    fontSize: 14,
    color: lightColors.text.secondary,
    lineHeight: 22,
  },
  securityText: {
    fontSize: 14,
    color: lightColors.text.secondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
