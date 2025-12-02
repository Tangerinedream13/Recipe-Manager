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
from datetime import date, datetime
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker

# Import Base + Recipe model
from models import Base, Recipe

# Step 2: Load environment variables
load_dotenv()

# Step 3: Connect to the database
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# Step 4: Create a function to get database sessions
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


# Step 5: Define our Pydantic models (schemas)


class RecipeBase(BaseModel):
    """Base schema with common fields for recipes"""

    title: str
    description: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    planned_for: Optional[date] = None  # new field


class RecipeCreate(RecipeBase):
    """Schema for creating a new recipe"""

    pass


class RecipeUpdate(BaseModel):
    """Schema for updating a recipe - all fields optional"""

    title: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    instructions: Optional[str] = None
    planned_for: Optional[date] = None  # new field


class RecipeResponse(RecipeBase):
    """Schema returned to the client"""

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


# Step 7: Create tables on startup
@app.on_event("startup")
async def create_tables():
    """
    Create all database tables on application startup.
    Ensures tables exist whether running locally or in Docker.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully")


# Step 8: Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development-friendly
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Step 9: API endpoints


# READ: Get all recipes (with search, sorting, pagination)
@app.get("/recipes", response_model=List[RecipeResponse])
async def get_all_recipes(
    q: Optional[str] = Query(
        None,
        description="Search recipes by text"
    ),
    sort: str = Query(
        "newest",
        description=(
            "Sort by: newest, oldest, title-asc, title-desc, updated, "
            "planned-asc, planned-desc"
        ),
    ),
    page: int = Query(0, ge=0, description="Page number (0-based)"),
    limit: int = Query(10, ge=1, le=50, description="Recipes per page"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all recipes with search, sorting, and pagination.

    Searchable fields:
    - title
    - description
    - ingredients

    Sorting:
    - newest: created_at desc
    - oldest: created_at asc
    - title-asc: alphabetical A→Z
    - title-desc: alphabetical Z→A
    - updated: recently updated first
    - planned-asc: earliest planned meals first
    - planned-desc: latest planned meals first
    """

    query = select(Recipe)
    
    # SEARCH
    if q:
        s = f"%{q}%"
        query = query.where(
            Recipe.title.ilike(s)
            | Recipe.description.ilike(s)
            | Recipe.ingredients.ilike(s)
        )

    # SORTING
    if sort == "newest":
        query = query.order_by(Recipe.created_at.desc())
    elif sort == "oldest":
        query = query.order_by(Recipe.created_at.asc())
    elif sort == "title-asc":
        query = query.order_by(Recipe.title.asc())
    elif sort == "title-desc":
        query = query.order_by(Recipe.title.desc())
    elif sort == "updated":
        query = query.order_by(Recipe.updated_at.desc())
    elif sort == "planned-asc":
        query = query.order_by(Recipe.planned_for.asc().nulls_last())
    elif sort == "planned-desc":
        query = query.order_by(Recipe.planned_for.desc().nulls_last())
    else:
        query = query.order_by(Recipe.created_at.desc())

    # PAGINATION
    offset = page * limit
    query = query.offset(offset).limit(limit)

    # Execute
    result = await db.execute(query)
    recipes = result.scalars().all()

    return recipes


# READ: Get single recipe
@app.get("/recipes/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(recipe_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a single recipe by its ID.
    Returns 404 if not found.
    """
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    recipe = result.scalar_one_or_none()

    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")

    return recipe


# CREATE: Add a new recipe
@app.post("/recipes", response_model=RecipeResponse, status_code=201)
async def create_recipe(recipe: RecipeCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new recipe record.
    """
    db_recipe = Recipe(
        title=recipe.title,
        description=recipe.description,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        planned_for=recipe.planned_for,
    )

    db.add(db_recipe)
    await db.commit()
    await db.refresh(db_recipe)

    return db_recipe


# UPDATE: Patch a recipe
@app.patch("/recipes/{recipe_id}", response_model=RecipeResponse)
async def patch_recipe(
    recipe_id: int, recipe_update: RecipeUpdate, db: AsyncSession = Depends(get_db)
):
    """
    Partially update an existing recipe.
    Only fields provided will be updated.
    """
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()

    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")

    update_data = recipe_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_recipe, field, value)

    db_recipe.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(db_recipe)

    return db_recipe


# NEW: PATCH endpoint for planning a recipe
@app.patch("/recipes/{recipe_id}/plan", response_model=RecipeResponse)
async def set_recipe_plan(
    recipe_id: int,
    planned_for: Optional[date] = Query(
        None, description="YYYY-MM-DD date to plan this recipe"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Assign or remove a planned cooking date for a recipe.
    """
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()

    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")

    db_recipe.planned_for = planned_for
    db_recipe.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(db_recipe)

    return db_recipe


# DELETE: Remove a recipe
@app.delete("/recipes/{recipe_id}", status_code=204)
async def delete_recipe(recipe_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete a recipe from the database.
    """
    result = await db.execute(select(Recipe).where(Recipe.id == recipe_id))
    db_recipe = result.scalar_one_or_none()

    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")

    await db.delete(db_recipe)
    await db.commit()

    return None


# Step 13: Serve static files (frontend)
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
        Allows React Router to handle navigation.
        """
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)

        raise HTTPException(status_code=404, detail="Frontend not found")


# Step 14: Run directly (dev mode)
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
