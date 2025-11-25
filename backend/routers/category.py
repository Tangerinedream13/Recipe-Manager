from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from server import get_db

from crud.category import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
)

from schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=list[CategoryResponse])
async def read_categories(db: AsyncSession = Depends(get_db)):
    return await get_categories(db)

@router.post("/", response_model=CategoryResponse, status_code=201)
async def create_new_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    return await create_category(db, category)

@router.get("/{category_id}", response_model=CategoryResponse)
async def read_category(category_id: int, db: AsyncSession = Depends(get_db)):
    cat = await get_category(db, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_existing_category(category_id: int, category: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    cat = await get_category(db, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return await update_category(db, cat, category)

@router.delete("/{category_id}", status_code=204)
async def delete_existing_category(category_id: int, db: AsyncSession = Depends(get_db)):
    cat = await get_category(db, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    await delete_category(db, cat)
    return None