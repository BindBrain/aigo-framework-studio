from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.assurance import AssuranceCreate
from app.services.assurance import get_assurance, list_assurances, save_assurance

router = APIRouter(prefix="/assurances", tags=["assurance"])


@router.post("")
def create_assurance(
    data: AssuranceCreate,
    db: Session = Depends(get_db),
):
    return save_assurance(db, data)


@router.get("")
def get_assurances(
    ai_system_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_assurances(db, ai_system_id)


@router.get("/{assurance_id}")
def get_assurance_record(
    assurance_id: str,
    db: Session = Depends(get_db),
):
    assurance = get_assurance(db, assurance_id)

    if assurance is None:
        raise HTTPException(status_code=404, detail="Assurance not found")

    return assurance
