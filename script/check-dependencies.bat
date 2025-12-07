@echo off
echo.
echo Checking Dependencies...
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  Node.js not found! Please install version 22.12.0
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do echo  Node.js: %%i

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo  npm not found! please install version 10.9.0
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do echo  npm: %%i

REM Check Tailwind binary
if exist "..\tailwindcss.exe" (
    echo  Tailwind CSS: tailwindcss.exe
) else (
    echo  Tailwind CSS not found at ..\tailwindcss.exe
    echo   Download from: https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.1
    exit /b 1
)

echo.
echo  All dependencies OK!
echo


if %errorlevel% neq 0 (
    echo Setup failed!
    exit /b 1
)
