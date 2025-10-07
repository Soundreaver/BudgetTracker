# Budget Tracker

A comprehensive **cloud-based** React Native budget tracking application built with Expo and Supabase, designed to help users manage their finances, track expenses, set budgets, and achieve savings goals with **multi-user support** and **real-time synchronization**.

![App Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.4-green.svg)
![Expo](https://img.shields.io/badge/Expo-~54.0.12-000020.svg)
![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ECF8E.svg)

## 📸 Screenshots

<p align="center">
  <img src="screenshots/dashboard.png" alt="Home Screen" width="250" />
  <img src="screenshots/transactions.png" alt="Expenses Screen" width="250" />
  <img src="screenshots/budget.png" alt="Stats Screen" width="250" />
</p>

## ✨ Features

### Core Features
- 🔐 **User Authentication** - Secure email/password authentication with Supabase Auth
- 📊 **Dashboard** - Overview of your financial status at a glance
- 💰 **Transaction Management** - Track income and expenses with detailed categorization
- 🎯 **Budget Planning** - Set and monitor budgets for different categories
- 📈 **Statistics & Analytics** - Visualize spending patterns with insights
- 🏆 **Savings Goals** - Set and track progress towards financial goals
- ⚙️ **Category Management** - Create custom categories with icons and colors
- 💱 **Multi-Currency Support** - Support for multiple currencies

### Cloud Features ☁️
- 🌐 **Cloud Sync** - Real-time synchronization across all your devices
- 👥 **Multi-User Support** - Each user has isolated, secure data
- 🔒 **Row Level Security** - Database-level security ensuring data privacy
- 📱 **Cross-Device** - Access your data from any device, anywhere
- 💾 **Automatic Backup** - Your data is safely stored in the cloud
- 🔄 **Real-time Updates** - Changes sync instantly across devices

### Security & Privacy
- 🔐 **Supabase Authentication** - Industry-standard secure authentication
- 🛡️ **Row Level Security (RLS)** - Database policies protect your data
- 🔑 **Session Management** - Secure, persistent sessions
- 🚫 **Data Isolation** - Your data is completely private from other users

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Library**: GlueStack UI
- **State Management**: Zustand
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Animations**: Moti & React Native Reanimated
- **Date Handling**: date-fns

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Real-time subscriptions
- **Storage**: AsyncStorage for local preferences
- **Security**: Row Level Security (RLS) policies

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **pnpm** - Comes with Node.js
- **Expo CLI** - Will be installed via npx
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/) (Free tier available)

### For Testing

- **Expo Go** app on your mobile device:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Soundreaver/BudgetTracker.git
cd budget-tracker
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Note your project URL and anon key from Settings → API

#### Run Database Migration

1. Open the Supabase SQL Editor in your project dashboard
2. Copy the contents of `supabase_query.sql`
3. Paste and run the SQL to create tables and security policies

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Environment
NODE_ENV=development
```

> **Important**: Never commit your `.env` file to version control. It contains sensitive credentials.

### 5. Verify Setup

The app will automatically:
- Connect to your Supabase database
- Create default categories for new users
- Set up authentication flows

## 🏃 Running the App

### Start the Development Server

```bash
npm start
```

This will start the Expo development server and display a QR code.

### Run on Different Platforms

**Android:**

```bash
npm run android
```

**iOS (macOS only):**

```bash
npm run ios
```

**Web:**

```bash
npm run web
```

### Using Expo Go (Recommended for Quick Testing)

1. Install Expo Go on your mobile device
2. Run `npm start` on your computer
3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## 📁 Project Structure

```
budget-tracker/
├── assets/                      # Images, fonts, and other static assets
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
├── src/
│   ├── components/              # Reusable UI components
│   │   └── ui/                  # UI component library
│   │       ├── AmountInput.tsx
│   │       ├── AnimatedTextReveal.tsx
│   │       ├── BottomSheet.tsx
│   │       ├── BudgetProgressCard.tsx
│   │       ├── CategoryBadge.tsx
│   │       ├── CategoryPicker.tsx
│   │       ├── ChartCard.tsx
│   │       ├── CustomButton.tsx
│   │       ├── CustomCard.tsx
│   │       ├── CustomInput.tsx
│   │       ├── DateTimePicker.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── StatCard.tsx
│   │       ├── TransactionCard.tsx
│   │       └── index.ts
│   ├── config/                  # Configuration files
│   │   └── gluestack-ui.config.ts
│   ├── constants/               # App constants and theme
│   │   └── theme.ts
│   ├── hooks/                   # Custom React hooks
│   ├── navigation/              # Navigation configuration
│   ├── providers/               # Context providers
│   │   └── QueryProvider.tsx
│   ├── screens/                 # Screen components
│   │   ├── BudgetScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── LoginScreen.tsx          # 🆕 Authentication
│   │   ├── SignUpScreen.tsx         # 🆕 Registration
│   │   ├── SavingsGoalsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── StatisticsScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   └── index.ts
│   ├── services/                # Business logic and Supabase services
│   │   ├── budgetService.ts
│   │   ├── categoryService.ts
│   │   ├── notificationService.ts
│   │   ├── savingsGoalService.ts
│   │   ├── supabase.ts              # 🆕 Supabase client
│   │   ├── transactionService.ts
│   │   └── index.ts
│   ├── store/                   # Zustand state management
│   │   ├── authStore.ts             # 🆕 Authentication state
│   │   ├── budgetStore.ts
│   │   ├── settingsStore.ts
│   │   ├── transactionStore.ts
│   │   └── index.ts
│   ├── types/                   # TypeScript type definitions
│   │   └── database.ts
│   └── utils/                   # Utility functions
│       ├── config.ts
│       ├── currency.ts
│       └── haptics.ts
├── screenshots/                 # App screenshots for documentation
├── .env.example                 # Environment variables template
├── .env                         # Your environment variables (not in git)
├── .gitignore                   # Git ignore rules
├── app.json                     # Expo configuration
├── App.tsx                      # Main app component
├── babel.config.js              # Babel configuration
├── index.ts                     # App entry point
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── supabase_migration.sql       # 🆕 Database schema & RLS policies
├── SUPABASE_MIGRATION_GUIDE.md  # 🆕 Setup guide
├── MIGRATION_STATUS.md          # 🆕 Migration documentation
└── README.md                    # This file
```

## 🗄️ Database

The app uses **Supabase (PostgreSQL)** for cloud data storage with the following tables:

### Tables
- **categories** - User's expense/income categories
- **transactions** - All financial transactions
- **budgets** - Budget limits per category
- **savings_goals** - Long-term savings targets

### Security
- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- 16 security policies protecting data integrity

### Features
- **Real-time Sync** - Changes sync instantly across devices
- **UUID Primary Keys** - Secure, globally unique identifiers
- **Automatic Timestamps** - Created/updated tracking
- **Data Validation** - Database-level constraints

## 🔐 Security Features

### Authentication
- **Email/Password Auth**: Secure user authentication via Supabase
- **Session Management**: Persistent, secure sessions with JWT tokens
- **Auto Sign-Out**: Sessions expire appropriately for security

### Data Security
- **Row Level Security (RLS)**: Database policies ensure users only access their data
- **Encrypted Storage**: Supabase handles data encryption at rest
- **Secure API**: All API calls use authenticated requests
- **Data Isolation**: Complete separation between user accounts

### Privacy
- **No Data Sharing**: Your data is never shared with other users
- **Cloud Backup**: Automatic backups by Supabase
- **GDPR Compliant**: Supabase infrastructure follows privacy regulations

## 📱 Features Breakdown

### Authentication 🆕
- Email/password sign up
- Secure login with session persistence
- Sign out functionality
- Automatic session refresh
- Protected routes

### Dashboard
- Quick overview of total balance
- Recent transactions with categories
- Budget status and progress
- Quick action button for adding transactions
- Real-time balance updates

### Transactions
- Add/edit/delete transactions with cloud sync
- Categorize income and expenses
- Filter and search capabilities
- Detailed transaction history grouped by date
- Pull to refresh for latest data
- Category-based organization

### Budget Management
- Set monthly/weekly/yearly budgets per category
- Track spending against budgets in real-time
- Visual progress indicators
- Budget alerts at 80% and 100% thresholds
- Create budgets for all expenses or specific categories
- Delete and manage budgets easily

### Statistics
- Spending trends over time
- Category-wise breakdown with percentages
- Smart recommendations based on spending patterns
- Period comparison (week/month/year/custom)
- Export and share reports
- Daily average spending insights

### Savings Goals
- Create multiple savings goals with custom icons/colors
- Track progress visually with progress bars
- Set target amounts and deadlines
- Add contributions to goals
- Calculate monthly savings needed
- Days remaining countdown

### Settings
- User profile display (email)
- Category management (add/edit/delete)
- Custom category icons and colors
- Currency settings (multiple currencies supported)
- Sign out functionality
- Real-time category sync

## 🔄 Data Synchronization

### Real-time Features
- **Instant Sync**: Changes appear across all devices immediately
- **Offline Support**: Changes queue and sync when online
- **Conflict Resolution**: Automatic handling of concurrent edits
- **Multi-Device**: Use on phone, tablet, and web simultaneously

### Sync Behavior
- Transactions sync in real-time
- Budgets update across devices
- Categories stay consistent
- Settings propagate instantly

## 🧪 Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier

### Code Quality

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run linting before committing:

```bash
npm run lint
```

Auto-fix issues:

```bash
npm run lint:fix
```

Format code:

```bash
npm run format
```

## 🌐 Deployment

### Building for Production

**Android APK:**
```bash
eas build --platform android --profile preview
```

**iOS:**
```bash
eas build --platform ios --profile preview
```

### Environment Variables for Production

Ensure your production `.env` has:
- Production Supabase URL
- Production Supabase anon key
- `NODE_ENV=production`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Message Convention

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🐛 Troubleshooting

### Common Issues

**1. Supabase connection errors**
```bash
# Verify your .env file has correct credentials
# Check Supabase project is active
# Ensure you've run the migration SQL
```

**2. Metro bundler not starting**
```bash
# Clear cache and restart
npx expo start -c
```

**3. Dependencies issues**
```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

**4. Authentication not working**
```bash
# Verify Supabase URL and anon key in .env
# Check you've run the database migration
# Ensure email confirmation is disabled in Supabase Auth settings (for testing)
```

**5. Data not syncing**
```bash
# Check internet connection
# Verify Supabase project status
# Check RLS policies are correctly applied
```

## 📚 Documentation

- **SUPABASE_MIGRATION_GUIDE.md** - Detailed setup and migration guide
- **MIGRATION_STATUS.md** - Complete migration documentation
- **supabase_migration.sql** - Database schema and RLS policies

## 🔄 Migration from SQLite

This app was migrated from SQLite to Supabase. For migration details, see:
- `SUPABASE_MIGRATION_GUIDE.md` - Step-by-step migration guide
- `MIGRATION_STATUS.md` - Complete migration status and changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Soundreaver**

- GitHub: [@Soundreaver](https://github.com/Soundreaver)
- Repository: [BudgetTracker](https://github.com/Soundreaver/BudgetTracker)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- UI components from [GlueStack UI](https://gluestack.io/)
- Icons from [Expo Vector Icons](https://icons.expo.fyi/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/)

## 📮 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Soundreaver/BudgetTracker/issues) page
2. Create a new issue with detailed description
3. Include screenshots and error logs when applicable
4. Check `SUPABASE_MIGRATION_GUIDE.md` for setup help

## 🚀 What's New in v1.0.0

- ✅ **Cloud-based Architecture** - Migrated from SQLite to Supabase
- ✅ **Multi-User Support** - Each user has their own secure account
- ✅ **Real-time Sync** - Data syncs instantly across all devices
- ✅ **Authentication** - Secure email/password authentication
- ✅ **Row Level Security** - Database-level data protection
- ✅ **Cross-Device Support** - Use on multiple devices simultaneously
- ✅ **Improved Performance** - Async operations for better UX
- ✅ **Enhanced Security** - Industry-standard authentication and encryption

---

**Happy Budget Tracking! 💰📊☁️**
