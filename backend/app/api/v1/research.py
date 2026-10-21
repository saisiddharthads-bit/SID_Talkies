import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rate_limiter import limiter
from app.api.deps import get_current_user, check_rate_limit
from app.models.user import User
from app.models.task import Task
from app.schemas.research import ResearchRequest, ResearchReport
from app.services.research_service import ResearchService

router = APIRouter()

@router.post("/", response_model=ResearchReport, dependencies=[Depends(check_rate_limit)])
async def execute_research(
    request: ResearchRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    limiter.check_and_increment_daily(user.id, feature="research")
    service = ResearchService(db)
    return await service.conduct_research(user.id, request)

@router.get("/tasks")
def list_research_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = (
        db.query(Task)
        .filter(Task.user_id == user.id, Task.task_type == "research")
        .order_by(Task.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    result = []
    for t in tasks:
        parsed_data = {}
        if t.result_data:
            try:
                parsed_data = json.loads(t.result_data)
            except Exception:
                pass
        result.append({
            "id": t.id,
            "status": t.status,
            "created_at": t.created_at.isoformat(),
            "report": parsed_data
        })
    return result
