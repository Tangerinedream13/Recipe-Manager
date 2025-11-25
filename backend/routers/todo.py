from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud.todo as todo_crud
import schemas.todo as todo_schema

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/")
def get_todos(db: Session = Depends(get_db)):
    return todo_crud.get_todos(db)

@router.post("/")
def create_todo(todo: todo_schema.TodoCreate, db: Session = Depends(get_db)):
    return todo_crud.create_todo(db, todo)

@router.get("/{todo_id}")
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    return todo_crud.get_todo(db, todo_id)

@router.delete("/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    return todo_crud.delete_todo(db, todo_id)