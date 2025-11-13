@echo off
REM Market Genie Standalone Landing Page Deployment Script
echo.
echo ========================================
echo Market Genie Standalone Landing Page
echo Deployment Verification Script
echo ========================================
echo.

REM Check if all required files exist
echo Checking file structure...
if exist "index.html" (
    echo ✓ index.html found
) else (
    echo ✗ index.html MISSING
    goto error
)

if exist "css\styles.css" (
    echo ✓ CSS file found
) else (
    echo ✗ CSS file MISSING
    goto error
)

if exist "js\main.js" (
    echo ✓ JavaScript file found
) else (
    echo ✗ JavaScript file MISSING
    goto error
)

if exist "assets\marketG.png" (
    echo ✓ Logo file found
) else (
    echo ✗ Logo file MISSING
    goto error
)

if exist "assets\marketgeniefavacon.png" (
    echo ✓ Favicon found
) else (
    echo ✗ Favicon MISSING
    goto error
)

echo.
echo ✅ All files verified!
echo.
echo Current payment URLs configured:
echo - Professional Plan: https://buy.stripe.com/4gM00j7zj17eeSwdGdaVa0v
echo - Lifetime Plan: https://buy.stripe.com/5kQeVd4n74jq39O1XvaVa0v
echo - Free Signup: https://market-genie-f2d41.web.app/free-signup
echo.
echo 📂 Ready for deployment!
echo.
echo Deployment Instructions:
echo 1. Upload entire folder to your web server
echo 2. Maintain folder structure (css/, js/, assets/)
echo 3. Access via: yourwebsite.com/path-to-folder/index.html
echo.
echo For subdomain deployment:
echo 1. Point subdomain to this folder
echo 2. Access via: subdomain.yourwebsite.com
echo.
goto end

:error
echo.
echo ❌ DEPLOYMENT ERROR: Missing required files!
echo Please ensure all files are present before deploying.
echo.

:end
pause