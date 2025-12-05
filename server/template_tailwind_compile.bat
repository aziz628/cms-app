@echo off
echo Building Tailwind CSS...
echo.

REM Check if tailwindcss.exe exists in the current directory

if exist ..\tailwindcss.exe (
    echo Using tailwindcss.exe from current directory
     ..\tailwindcss.exe -c tailwind.config.js -i public\css\input.css -o public\css\output.css --minify %*
) else (
    echo tailwindcss.exe not found in current directory
)

echo.
echo Build process complete!
