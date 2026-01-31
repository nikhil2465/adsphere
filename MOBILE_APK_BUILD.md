@echo off
echo ========================================
echo AdSphere Mobile - APK Builder
echo ========================================
echo.

echo [1/5] Checking prerequisites...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java JDK is not installed or not in PATH
    echo Please install JDK 11+ from https://adoptium.net/
    pause
    exit /b 1
)

adb version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Android SDK is not installed or not in PATH
    echo Please install Android Studio from https://developer.android.com/studio
    pause
    exit /b 1
)

echo ✓ Java and Android SDK are available
echo.

echo [2/5] Preparing mobile app...
cd /d "%~dp0mobile"
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install mobile dependencies
        pause
        exit /b 1
    )
)

echo ✓ Mobile app dependencies ready
echo.

echo [3/5] Starting Metro bundler...
start "Metro Bundler" cmd /k "npm start"
echo Waiting for Metro bundler to start...
timeout 30

echo [4/5] Building APK...
cd android

echo Building debug APK...
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Failed to build debug APK
    pause
    exit /b 1
)

echo ✓ Debug APK built successfully
echo.

echo [5/5] APK Information...
echo ========================================
echo APK Location:
echo %cd%\app\build\outputs\apk\debug\app-debug.apk
echo.
echo APK Size:
for %%I in (app\build\outputs\apk\debug\app-debug.apk) do echo %%~zI bytes
echo.

echo To install on device:
echo 1. Enable USB Debugging on your Android device
echo 2. Connect device via USB
echo 3. Run: adb install app\build\outputs\apk\debug\app-debug.apk
echo.

echo To build release APK:
echo 1. Generate signing key: keytool -genkey -v -keystore adsphere-release-key.keystore -alias adsphere -keyalg RSA -keysize 2048 -validity 10000
echo 2. Configure signing in android/app/build.gradle
echo 3. Run: gradlew assembleRelease
echo.

echo ========================================
echo APK Build Complete!
echo ========================================
pause
