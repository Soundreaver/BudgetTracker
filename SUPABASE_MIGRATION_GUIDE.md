# Supabase Migration Guide

This guide will help you complete the migration from SQLite to Supabase with multi-user authentication.

## ✅ Completed Steps

The following has been completed for you:

1. ✅ Installed Supabase dependencies (`@supabase/supabase-js`, `react-native-url-polyfill`)
2. ✅ Created Supabase database schema with RLS policies (`supabase_migration.sql`)
3. ✅ Set up environment configuration (`.env.example`)
4. ✅ Created Supabase client service (`src/services/supabase.ts`)
5. ✅ Updated TypeScript type definitions (changed from `number` to `string` UUIDs)
6. ✅ Implemented Supabase authentication in authStore
7. ✅ Migrated all service layers (categories, transactions, budgets, savings goals)
8. ✅ Created Login and SignUp screens

## 🔧 Remaining Steps

### Step 1: Set Up Supabase Database

1. Go to your Supabase project dashboard at https://supabase.com
2. Navigate to the SQL Editor
3. Copy the entire contents of `supabase_migration.sql`
4. Paste and run it in the SQL Editor
5. Verify that all tables and policies were created successfully

### Step 2: Configure Environment Variables

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials from your project dashboard:
   - Go to Project Settings > API
   - Copy the Project URL
   - Copy the anon/public key

3. Update `.env` file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NODE_ENV=development
   ```

### Step 3: Update App.tsx for Authentication

Your `App.tsx` needs to be updated to:
1. Initialize auth state on app load
2. Show Login/SignUp screens when not authenticated
3. Show main app when authenticated

Create or update `App.tsx`:

```typescript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { QueryProvider } from './src/providers/QueryProvider';
import { useAuthStore } from './src/store/authStore';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { config } from './src/config/gluestack-ui.config';

// Import your main app navigator (create this or use existing)
import { MainNavigator } from './src/navigation/MainNavigator';

const Stack = createStackNavigator();

export default function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <GluestackUIProvider config={config}>
      <QueryProvider>
        <NavigationContainer>
          {isAuthenticated ? (
            <MainNavigator />
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </QueryProvider>
    </GluestackUIProvider>
  );
}
```

### Step 4: Update Navigation Structure

Create `src/navigation/MainNavigator.tsx` for your authenticated app navigation:

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { SavingsGoalsScreen } from '../screens/SavingsGoalsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
// Import your tab bar icons

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Savings" component={SavingsGoalsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
```

### Step 5: Update Screen Components

All screens that use the old service methods need to be updated to handle async operations.

**Example for DashboardScreen.tsx:**

```typescript
// OLD (synchronous SQLite)
const categories = getAllCategories();

// NEW (async Supabase)
const loadCategories = async () => {
  try {
    const categories = await getAllCategories();
    setCategories(categories);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

useEffect(() => {
  loadCategories();
}, []);
```

Apply this pattern to all screens:
- `DashboardScreen.tsx`
- `TransactionsScreen.tsx`
- `BudgetScreen.tsx`
- `SavingsGoalsScreen.tsx`
- `StatisticsScreen.tsx`
- `SettingsScreen.tsx`

### Step 6: Update SettingsScreen for Sign Out

Add sign out functionality to your SettingsScreen:

```typescript
import { useAuthStore } from '@/store/authStore';

const SettingsScreen = () => {
  const { signOut, user } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View>
      <Text>Email: {user?.email}</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Step 7: Remove SQLite Dependencies

After verifying everything works with Supabase:

1. Uninstall expo-sqlite:
   ```bash
   npm uninstall expo-sqlite
   ```

2. Delete the old SQLite database file:
   ```bash
   rm src/services/database.ts
   ```

3. Remove any references to `openDatabase` or `initDatabase`

### Step 8: Update Store Initialization

Update any stores that were calling SQLite init functions:

```typescript
// Remove this from stores or app initialization:
// import { initDatabase } from '@/services/database';
// await initDatabase();

// The database is now automatically initialized via Supabase
```

## 🧪 Testing the Migration

### 1. Test User Sign Up
- Open the app
- Navigate to Sign Up screen
- Create a new account
- Verify email confirmation (check spam folder)

### 2. Test User Sign In
- Sign out if logged in
- Navigate to Login screen
- Sign in with your credentials
- Verify successful authentication

### 3. Test Data Isolation
- Create some data (categories, transactions, etc.)
- Sign out
- Create another account and sign in
- Verify you don't see the first user's data
- Sign back in with first account
- Verify all original data is still there

### 4. Test All CRUD Operations
For each data type (categories, transactions, budgets, savings goals):
- ✅ Create new records
- ✅ Read/display records
- ✅ Update existing records
- ✅ Delete records

### 5. Test Default Categories
- Create a new user account
- Verify that default categories are automatically created
- Categories should include: Food, Transport, Shopping, Entertainment, Bills, Healthcare, Salary, Freelance

## 🔒 Security Features

Your app now has:

1. **Row Level Security (RLS)**: Users can only access their own data
2. **User Authentication**: Email/password authentication via Supabase Auth
3. **Session Management**: Automatic session refresh and persistence
4. **Data Isolation**: Each user's data is completely separate

## 📝 Important Notes

### UUID vs Integer IDs
- All IDs are now UUIDs (strings) instead of integers
- Update any components that assumed numeric IDs
- Example: `parseInt(id)` should now just use `id`

### Async Operations
- All database operations are now async
- Always use `await` when calling service methods
- Handle errors with try/catch blocks

### Type Safety
- TypeScript types have been updated
- Fix any type errors in your components
- The `user_id` field is automatically handled in services

### Email Verification
- Supabase sends verification emails by default
- Configure email templates in Supabase dashboard
- Users must verify email to fully access the app (optional)

## 🚀 Optional Enhancements

### Real-time Updates
Enable real-time syncing across devices:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('transactions')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'transactions' },
      (payload) => {
        console.log('Change received!', payload);
        // Refresh your data
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### OAuth Providers
Add social login (Google, Apple, etc.) in Supabase dashboard under Authentication > Providers.

### Offline Support
Implement local caching with React Query for offline functionality.

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Verify `.env` file exists in project root
- Check environment variable names start with `EXPO_PUBLIC_`
- Restart Expo dev server after changing `.env`

### "User not authenticated" errors
- Check that auth is initialized in App.tsx
- Verify user is signed in
- Check session is valid in authStore

### RLS Policy Errors
- Verify all RLS policies were created in Supabase
- Check user is authenticated before database operations
- Review Supabase logs for policy violations

### TypeScript Errors
- Run `npm run lint` to see all errors
- Update components to handle async operations
- Convert number IDs to string UUIDs

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

---

**Need Help?** Check the Supabase dashboard logs and browser console for detailed error messages.
