@echo off
echo Compiling Tailwind CSS...

REM compiling Tailwind CSS  with any passed arguments 
..\tailwindcss.exe -c .\tailwind.config.mjs -i .\src\index.css -o .\src\assets\css\output.css --minify %*

REM using watched mode in development or minified in production setups