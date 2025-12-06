#!/bin/bash

echo "Starting all processes..."
echo ""


# Check tailwindcss
if [ ! -f "../tailwindcss" ]; then
    echo "Error: Dependencies not installed. Run ./check-dependencies.sh first"
    exit 1
fi

# Store PIDs for cleanup
pids=()

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping all processes..."
    for pid in "${pids[@]}"; do
        kill $pid 2>/dev/null
    done
    exit 0
}

# listen for termination signals to cleanup (ctrl+c and kill)
trap cleanup SIGINT SIGTERM

# Start the server
echo "Starting server..."
cd ../server
node server.js &
pids+=($!)


# Start server template tailwind compiler
echo "Compiling server template Tailwind..."
bash template_tailwind_compile.sh --watch &
pids+=($!)
cd ..

# Start the Tailwind CSS compiler
echo "Starting Tailwind CSS compiler..."
cd frontend
bash ./compile_tailwind.sh --watch &
pids+=($!)


# Start the React app
echo "Starting React app..."
npm run dev &
pids+=($!)
cd ..



echo ""
echo " All processes have been started!"
echo ""
echo "Running processes:"
echo "  - Server (PID: ${pids[0]})"
echo "  - Server Tailwind (PID: ${pids[1]})"
echo "  - React App (PID: ${pids[2]})"
echo "  - Node Watcher (PID: ${pids[3]})"
echo "  - Frontend Tailwind (PID: ${pids[4]})"
echo ""
echo "Press Ctrl+C to stop all processes"
echo ""

# Wait for all background processes
wait