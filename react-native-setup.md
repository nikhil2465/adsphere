# React Native Setup Guide for AdSphere Mobile App

## 📋 Prerequisites Check

### 1. Node.js (Already Installed)
```bash
# Check your Node.js version
node --version
# Should be v14 or higher
```

### 2. Java Development Kit (JDK)
```bash
# Install JDK 11 or higher
# Download from: https://adoptium.net/
```

### 3. Android Studio
```bash
# Download from: https://developer.android.com/studio
# Install Android SDK (API level 33 or higher)
# Set up Android Virtual Device (AVD)
```

### 4. React Native CLI
```bash
# Install React Native CLI globally
npm install -g @react-native-community/cli
```

## 🛠️ Windows Setup Commands

### Install Chocolatey (if not installed)
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Install Dependencies
```powershell
# Install Node.js, Python, JDK
choco install nodejs python jdk8

# Install React Native CLI
npm install -g @react-native-community/cli

# Install Watchman (for file watching)
choco install watchman
```

## 📱 Android Setup

### 1. Install Android Studio
- Download: https://developer.android.com/studio
- Install with default settings
- Open Android Studio

### 2. Configure Android SDK
- Go to SDK Manager
- Install Android 13 (API level 33)
- Install Android SDK Build-Tools
- Install Android SDK Platform-Tools

### 3. Set Up Virtual Device
- Open AVD Manager
- Create new Virtual Device
- Choose Pixel 6 or similar
- Select Android 13 (API level 33)
- Finish setup

### 4. Environment Variables
```powershell
# Add to System Environment Variables
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
PATH += %ANDROID_HOME%\platform-tools
PATH += %ANDROID_HOME%\tools
```

## 🧪 Verify Setup

### Test React Native CLI
```bash
# Check React Native CLI
npx react-native --version
```

### Test Android Setup
```bash
# List available devices
npx react-native doctor
```

## 🚀 Ready for Next Step

Once setup is complete, we'll:
1. Create the AdSphere mobile project
2. Design the mobile UI
3. Connect to your API
4. Build the APK

## ⚠️ Common Issues & Solutions

### Issue: "ANDROID_HOME not set"
**Solution**: Set environment variables as shown above

### Issue: "Failed to install app"
**Solution**: Make sure Android emulator is running

### Issue: "Metro bundler issues"
**Solution**: Clear cache: `npx react-native start --reset-cache`

## 📞 Need Help?
If you encounter any issues during setup, let me know and I'll help you troubleshoot!
