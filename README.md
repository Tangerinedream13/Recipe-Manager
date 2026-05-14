# Project 2: Full-Stack Recipe Manager Application

A full-stack web application built with FastAPI (backend), React (frontend), PostgreSQL (database), Docker (containerization).

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** React, Vite
- **Database:** PostgreSQL
- **Containerization:** Docker, Docker Compose

## Project Structure

project02-fall2025/
├── backend/        # FastAPI backend
├── database/       # PostgreSQL Dockerfile
├── ui/             # React frontend (Vite + Chakra UI)
├── docker-compose.yaml
├── requirements.txt
├── package.json
└── README.md


## Getting Started
1. Clone the repository 
   git clone https://github.com/mariahaddon/project02-fall2025
   cd project02-fall2025
2. Start all services
   docker-compose up --build
3. Access the app
	•	Frontend (React): http://localhost:5173
	•	Backend API (FastAPI): http://localhost:8000
	•	API Docs (Swagger): http://localhost:8000/docs
   The backend, frontend, and database will automatically start inside Docker.
4. If you want to run the React app outside Docker
   Frontend: 
   cd ui
   npm install
   npm run dev

   Backend: 
   cd backend
   pip install -r ../requirements.txt
   uvicorn server:app --reload


### Prerequisites
- Docker Desktop installed and running
All environment variables are handled inside docker-compose.yaml
The frontend communicates iwth the backend at http://localhost:8000


Weblink:  https://project02-fall2025-production-c014.up.railway.app




