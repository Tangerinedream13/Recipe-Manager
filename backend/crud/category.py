from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.category import Category

async def get_categories(db: AsyncSession):
    result = await db.execute(select(Category))
    return result.scalars().all()

async def get_category(db: AsyncSession, category_id: int):
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()

async def create_category(db: AsyncSession, category_data):
    category = Category(name=category_data.name)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

async def update_category(db: AsyncSession, db_category, category_data):
    db_category.name = category_data.name
    await db.commit()
    await db.refresh(db_category)
    return db_category

async def delete_category(db: AsyncSession, db_category):
    await db.delete(db_category)
    await db.commit()