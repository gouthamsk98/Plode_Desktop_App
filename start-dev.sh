#!/bin/bash

# Start the Node.js server in the background
echo "Starting Node.js server..."
node index.js &
NODE_PID=$!

# Wait for server to start
sleep 3

echo "Node.js server started with PID: $NODE_PID"
echo "Server is running at http://localhost:3123"

# Function to cleanup on exit
cleanup() {
    echo "Stopping Node.js server..."
    kill $NODE_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start Tauri development server
echo "Starting Tauri development server..."
cd src-tauri
cargo tauri dev

# Keep the script running
wait
