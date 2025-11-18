@echo off
echo Building Tailwind CSS...
echo.

REM Check if tailwindcss.exe exists in the current directory
if exist "./tailwindcss.exe" (
    echo Using tailwindcss.exe from current directory
    tailwindcss.exe -i public/css/input.css -o public/css/output.css --watch
) else (
    echo tailwindcss.exe not found in current directory
    echo Trying to use globally installed tailwindcss
    tailwindcss -c tailwind.config.js -i public/css/input.css -o public/css/output.css --watch
)

echo.
echo Build process complete!
