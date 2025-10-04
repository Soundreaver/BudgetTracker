import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { QueryProvider } from './src/providers/QueryProvider';
import { config } from './src/config/gluestack-ui.config';
import { initDatabase } from './src/services/database';
import {
  DashboardScreen,
  TransactionsScreen,
  StatisticsScreen,
  BudgetScreen,
  SavingsGoalsScreen,
} from './src/screens';

const Tab = createBottomTabNavigator();

function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
          headerTitle: 'Budget Tracker',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet-outline" size={24} color={color} />
          ),
          tabBarLabel: 'Expenses',
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={24} color={color} />
          ),
          tabBarLabel: 'Stats',
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="calculator-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Savings"
        component={SavingsGoalsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet-outline" size={24} color={color} />
          ),
          headerTitle: 'Savings Goals',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      try {
        await initDatabase();
        setIsDbInitialized(true);
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    initDb();
  }, []);

  if (!isDbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 10 }}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GluestackUIProvider config={config}>
          <QueryProvider>
            <NavigationContainer>
              <MainNavigator />
            </NavigationContainer>
            <StatusBar style="auto" />
          </QueryProvider>
        </GluestackUIProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
