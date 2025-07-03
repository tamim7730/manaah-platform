#!/bin/bash

# Manaah Platform MCP Server Start Script
# This script starts the MCP server with proper environment setup

set -e

echo "🚀 Starting Manaah Platform MCP Server..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using environment variables or defaults."
    echo "💡 Tip: Copy .env.example to .env and configure your settings."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "🔨 Building TypeScript..."
    npm run build
fi

# Set default environment variables if not set
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-3000}
export MCP_SERVER_NAME=${MCP_SERVER_NAME:-"manaah-platform"}
export MCP_SERVER_VERSION=${MCP_SERVER_VERSION:-"1.0.0"}

echo "🌍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"
echo "📡 MCP Server: $MCP_SERVER_NAME v$MCP_SERVER_VERSION"

# Start the server
if [ "$NODE_ENV" = "development" ]; then
    echo "🔧 Starting in development mode..."
    npm run dev
else
    echo "🚀 Starting in production mode..."
    npm start
fi