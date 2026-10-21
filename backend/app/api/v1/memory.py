from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, check_rate_limit
from app.models.user import User
from app.schemas.memory import MemoryCreate, MemoryUpdate, MemoryResponse
from app.services.memory_service import MemoryService

router = APIRouter()

@router.post("/", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(check_rate_limit)])
def create_memory(
    data: MemoryCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = MemoryService(db)
    return service.create_memory(user.id, data)

@router.get("/", response_model=List[MemoryResponse])
def list_memories(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = MemoryService(db)
    return service.list_memories(user.id, skip=skip, limit=limit)

@router.get("/{memory_id}", response_model=MemoryResponse)
def get_memory(
    memory_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = MemoryService(db)
    return service.get_memory(user.id, memory_id)

@router.put("/{memory_id}", response_model=MemoryResponse)
def update_memory(
    memory_id: str,
    data: MemoryUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = MemoryService(db)
    return service.update_memory(user.id, memory_id, data)

@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory(
    memory_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = MemoryService(db)
    service.delete_memory(user.id, memory_id)
    return None

@router.delete("/all/clear")
def clear_all_memories(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = MemoryService(db)
    deleted_count = service.clear_all_memories(user.id)
    return {"message": f"Successfully deleted {deleted_count} memories."}
