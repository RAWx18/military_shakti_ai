# Full Stack Project Setup Guide

## Project Overview
This project implements a full-stack application with:
- Frontend: Next.js application
- Backend: FastAPI server
- Databases: MongoDB and Redis
- AI Model Integration: Custom Shakti model

## Table of Contents
- [Prerequisites](#prerequisites)
- [Model Setup](#model-setup)
- [Database Installation](#database-installation)
  - [MongoDB Setup](#mongodb-setup)
  - [Redis Setup](#redis-setup)
- [Application Setup](#application-setup)
  - [Frontend Configuration](#frontend-configuration)
  - [Backend Configuration](#backend-configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
1. Python (3.8 or higher)
2. Node.js (18.0 or higher) and npm
3. MongoDB Community Edition
4. MongoDB Compass (Optional GUI tool)
5. Redis Server
6. Git

### System Requirements
- Operating System: Ubuntu 20.04 or higher (Linux)
- RAM: Minimum 8GB (16GB recommended)
- Storage: At least 10GB free space

## Model Setup

### Download Model
1. Download the Shakti model file:
   - Source: [Google Drive - model.safetensor](https://drive.google.com/file/d/1EqWIRrYYMi_pCyFQE5FN5c5YjH0hlD7e/view?usp=sharing)
   - File size: Approximately 2GB

### Model Configuration
1. Navigate to the model directory:
   ```bash
   cd shakti-2B-041224
   ```

2. Place the downloaded model file:
   - Copy `model.safetensor` to the current directory

3. Configure model settings in `config_model.py`:
   ```python
   # Choose computation type
   COMPUTE_TYPE = "cpu"  # Options: "gpu" or "cpu"

   # Choose operation mode
   MODE = "notmodel"  # Options: "model" or "notmodel"
   ```

   Note:
   - Use "gpu" if you have CUDA-compatible GPU
   - "notmodel" mode runs without AI model for testing

## Database Installation

### MongoDB Setup

1. Import the MongoDB public key:
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   ```

2. Add MongoDB repository:
   ```bash
   # For Ubuntu 20.04 (Focal)
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

   # For Ubuntu 22.04 (Jammy)
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. Install MongoDB:
   ```bash
   sudo apt update
   sudo apt install -y mongodb-org
   ```

4. Start MongoDB service:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. Verify installation:
   ```bash
   mongosh
   # Expected output: Connected to MongoDB at localhost:27017
   ```

### Redis Setup

1. Install Redis server:
   ```bash
   # Add Redis repository
   sudo apt-get install lsb-release curl gpg
   curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
   sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list

   # Install Redis
   sudo apt-get update
   sudo apt-get install redis
   ```

2. Configure Redis service:
   ```bash
   sudo systemctl enable redis-server
   sudo systemctl start redis-server
   ```

3. Verify Redis installation:
   ```bash
   redis-cli ping
   # Expected output: PONG
   ```

## Application Setup

### Frontend Configuration

1. Setup frontend application:
   ```bash
   # Navigate to frontend directory
   cd frontend

   # Install dependencies
   npm install
   ```

2. Create environment file `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at: http://localhost:3000

### Backend Configuration

1. Setup backend server:
   ```bash
   # Navigate to backend directory
   cd backend

   # Create virtual environment (recommended)
   python -m venv venv
   source venv/bin/activate  # On Linux
   ```

2. Create environment file `.env`:
   ```env
   DATABASE_URL=mongodb://localhost:27017/SIH
   DEBUG=True
   SECRET_KEY=your_secret_key_here
   REDIS_URL=redis://localhost:6379
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start backend server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The API will be available at: http://localhost:8000

## Running the Application

1. Ensure all services are running:
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod

   # Check Redis status
   sudo systemctl status redis-server
   ```

2. Start the applications:
   ```bash
   # Terminal 1: Frontend
   cd frontend
   npm run dev

   # Terminal 2: Backend
   cd backend
   source venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Troubleshooting

Common issues and solutions:

1. MongoDB Connection Error:
   ```bash
   # Check MongoDB logs
   sudo tail -f /var/log/mongodb/mongod.log

   # Restart MongoDB
   sudo systemctl restart mongod
   ```

2. Redis Connection Error:
   ```bash
   # Check Redis logs
   sudo tail -f /var/log/redis/redis-server.log

   # Restart Redis
   sudo systemctl restart redis-server
   ```

3. Package Installation Issues:
   ```bash
   # Clear npm cache
   npm cache clean --force

   # Clear pip cache
   pip cache purge
   ```

For additional support, please check the project's issue tracker or documentation.