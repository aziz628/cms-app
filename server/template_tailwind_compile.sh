#!/bin/bash

echo "Compiling Tailwind CSS for server templates..."
echo ""

# Print current directory
echo "Current Directory: $(pwd)"
echo ""

# Check if tailwindcss executable exists
if [ ! -f "../tailwindcss" ]; then
    echo "Error: tailwindcss executable not found at ../tailwindcss"
    echo "Please ensure Tailwind CSS is installed."
    exit 1
fi

# Compile Tailwind CSS with any passed arguments
../tailwindcss -c ./tailwind.config.mjs -i ./src/index.css -o ./public/css/tailwind-output.css --minify "$@"

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "Tailwind CSS compilation completed successfully."
else
    echo ""
    echo "Tailwind CSS compilation failed."
    exit 1
fi