#!/bin/bash

echo ""
echo "Checking Dependencies..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js not found! Please install version 22.12.0"
    exit 1
fi
echo "Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "npm not found! Please install version 10.9.0"
    exit 1
fi
echo "npm: $(npm --version)"

# Check Tailwind binary
if [ -f "./tailwindcss" ]; then
    echo "Tailwind CSS: ./tailwindcss"
else
    echo "Tailwind CSS not found at ./tailwindcss"
    echo "Download from: https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.1"
    exit 1
fi

echo ""
echo "All dependencies OK!"


if [ $? -ne 0 ]; then
    echo "Setup failed!"
    exit 1
fi
