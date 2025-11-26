"""
Simple FastAPI Starter - Recipe API
==================================

This is a minimal FastAPI example, designed for beginners.
It shows the basic structure of a REST API with database access.

HOW IT WORKS:
1. Client (your React app) makes a request to a URL (e.g., /recipes)
2. FastAPI finds the function decorated with @app.get("/recipes")
3. That function uses the database connection to query data
4. The function returns data, which FastAPI converts to JSON
5. The JSON is sent back to the client
"""

# Step 1: Import what we need
import os
from datetime import datetime
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker

# Import Base + Recipe model
from models import Base, Recipe

# Step 2: Load environment variables from .env file
# Looks for .env file in current directory and parent directories
load_dotenv()

# Step 3: Connect to the database
# Get DATABASE_URL from environment variable, fallback to local development
# Format: postgresql+asyncpg://username:password@host:port/database_name
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the database engine - this manages the connection pool
# Think of it as a "factory" that creates database connections
engine = create_async_engine(DATABASE_URL, echo=False)

# Create a session factory - this creates individual database sessions
# Each request will get its own session to query the database
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# Step 4: Create a function to get database sessions
# This is called a "dependency" - FastAPI will automatically call this
# for each request and pass the result to your endpoint functions
async def get_db():
    """
    Generator function that yields a database session.

    The 'yield' keyword is special - it:
    1. Creates a session when the function is called
    2. Gives it to your endpoint function
    3. Closes the session when the endpoint finishes

    This ensures database connections are properly cleaned up.
    """
    async with AsyncSessionLocal() as session:
        yield session
        # After the endpoint finishes, the session is automatically closed


# Step 5: Define what our API requests and responses will look like
# These are called "Pydantic models" or "schemas"
# They define the structure of data that will be sent to and from the API


class RecipeBase(BaseModel):
    """Base schema with common fields for recipes"""

    title: str
    description: Optional[str] = None
    ingredients: Optional[str] = None  # comma-separated or text block
    instructions: Optional[str] = None  # full cooking instructions


class RecipeCreate(RecipeBase):
    """Schema for creating a new recipe"""

    pass


class RecipeUpdate(BaseModel):
    """Schema for updating a recipe - all fields optional"""

    title: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None


class RecipeResponse(RecipeBase):
    """What a recipe looks like when we send it back to the client"""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Step 6: Create the FastAPI app
app = FastAPI(
    title="Recipe API",
    description="A simple CRUD API for managing recipe items",
)


# Step 7: Create database tables on startup
@app.on_event("startup")
async def create_tables():
    """
    Create all database tables on application startup.
    This uses SQLAlchemy to generate tables from your model definitions.
    Works for both Docker and Railway databases.

    Note: Docker Compose's depends_on: service_healthy ensures the database
    is ready before this code runs.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully")


# Step 8: Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (development-friendly)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Step 9: Create our API endpoints
# IMPORTANT: API routes must be defined BEFORE the SPA catch-all route


# READ: Get all recipes
@app.get("/recipes", response_model=List[RecipeResponse])
async def get_all_recipes(db: AsyncSession = Depends(get_db)):
    """
    Get all recipes from the database.

    Returns: A list of all recipes in the database
    """
    result = await db.execute(select(Recipe))
    recipes = result.scalars().all()
    return recipes


# READ: Get a single recipe by ID
@app.get("/recipes/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(recipe_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a single recipe by its ID.

    Returns: The recipe if found, or a 404 error if not
    """
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    recipe = result.scalar_one_or_none()

    if recipe is None:
        raise HTTPException(
            status_code=404, detail=f"Recipe with ID {recipe_id} not found"
        )

    return recipe


# CREATE: Create a new recipe
@app.post("/recipes", response_model=RecipeResponse, status_code=201)
async def create_recipe(recipe: RecipeCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new recipe.

    Returns: The created recipe
    """
    # Create a new Recipe object from the request data
    db_recipe = Recipe(
        title=recipe.title,
        description=recipe.description,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
    )

    # Add and commit to database
    db.add(db_recipe)
    await db.commit()
    await db.refresh(db_recipe)

    return db_recipe


# UPDATE: Update an existing recipe (PATCH - partial update)
@app.patch("/recipes/{recipe_id}", response_model=RecipeResponse)
async def patch_recipe(
    recipe_id: int, recipe_update: RecipeUpdate, db: AsyncSession = Depends(get_db)
):
    """
    Partially update an existing recipe item (PATCH).
    Only the fields provided in the request will be updated.
    Returns: The updated recipe, or a 404 error if not found.
    """
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()

    if db_recipe is None:
        raise HTTPException(
            status_code=404, detail=f"Recipe with ID {recipe_id} not found"
        )

    # Update only submitted fields
    update_data = recipe_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_recipe, field, value)

    # Update timestamp
    db_recipe.updated_at = datetime.utcnow()

    # Commit changes
    await db.commit()
    await db.refresh(db_recipe)

    return db_recipe


# DELETE: Delete a recipe
@app.delete("/recipes/{recipe_id}", status_code=204)
async def delete_recipe(recipe_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete a recipe.

    Returns: 204 No Content if successful, or 404 if not found
    """
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()

    if db_recipe is None:
        raise HTTPException(
            status_code=404, detail=f"Recipe with ID {recipe_id} not found"
        )

    await db.delete(db_recipe)
    await db.commit()

    return None


# Step 13: Serve static files (frontend) in production
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):

    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(static_dir, "assets")),
        name="assets",
    )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """
        Serve the React app for all non-API routes.
        This allows React Router to handle client-side routing.
        """
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend not found")


# Step 14: Run the server (only for direct execution)
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
# end of file
