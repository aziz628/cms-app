@echo off
echo Starting all processes...

REM Start the server in a new tab
wt -w 0 nt -d ".\server" cmd /k "node server.js"
echo Server started.

REM Start the React app in a new tab
wt -w 0 nt -d ".\frontend" cmd /k "npm run dev"
echo React app started.

REM Start the node watcher in a new tab
wt -w 0 nt -d ".\frontend" cmd /k "node watch-and-move-tailwind.js"
echo Node watcher started.

REM Start the Tailwind CSS compiler in a new tab
wt -w 0 nt -d ".\frontend" cmd /k "compile_tailwind.bat --watch"
echo Tailwind CSS compiler started.

echo All processes have been started.

REM explain all keywords used in this file : 
REM - @echo off : This command disables the display of commands in the command prompt window, making the output cleaner.
REM - echo : This command prints a message  to the command prompt window.
REM - wt : This is the command to launch Windows Terminal. 
REM - -w 0 : This option specifies the window to open the new tab in. "0" refers to the first window.
REM - nt : This option opens a new tab in the specified window.