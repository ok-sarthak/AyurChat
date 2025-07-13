#!/bin/bash

# AyurChat Development Setup Script
echo "🌿 Starting AyurChat Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the ChatBot root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing dependencies...${NC}"

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

cd ..

echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"

# Check for .env file
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found!${NC}"
    echo -e "${YELLOW}Please create backend/.env with:${NC}"
    echo "MONGODB_URI=mongodb://localhost:27017/ayurchat"
    echo "JWT_SECRET=your_super_secure_jwt_secret_key_here"
    echo "GEMINI_API_KEY=your_gemini_api_key_here"
    echo "PORT=5001"
    echo ""
fi

echo -e "${GREEN}🚀 Ready to start development servers!${NC}"
echo -e "${YELLOW}Run the following commands in separate terminals:${NC}"
echo ""
echo -e "${GREEN}Terminal 1 (Backend):${NC}"
echo "cd backend && npm start"
echo ""
echo -e "${GREEN}Terminal 2 (Frontend):${NC}"
echo "cd frontend && npm run dev"
echo ""
echo -e "${GREEN}🌟 Access your application at: http://localhost:5173${NC}"
echo -e "${GREEN}📡 Backend API running at: http://localhost:5001${NC}"
