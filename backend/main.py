from fastapi import FastAPI
from routers import category
from routers import todo  

from models.base import Base
from database import engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TODO API")

# Routers
app.include_router(category.router)
# app.include_router(todo.router)  

@app.get("/")
def root():
    return {"message": "Backend is running!"}