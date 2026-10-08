from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.schemas.ai_system import AISystemCreate
from app.schemas.approval import ApprovalCreate
from app.schemas.classification import AIClassificationCreate
from app.schemas.evaluation import EvaluationRequestCreate
from app.schemas.evidence import EvidenceCreate
from app.schemas.monitoring import MonitoringCreate
from app.schemas.risk import RiskCreate
from app.schemas.control import ControlCreate
from app.schemas.review import ReviewCreate
from app.schemas.rules import GovernanceRulesUpdate
from app.schemas.rule_results import RuleResultsUpdate

from app.services.ai_systems import create_ai_system, list_ai_systems
from app.services.approval import get_approval, save_approval
from app.services.classifications import delete_classification, get_classification, save_classification
from app.services.evaluations import get_evaluation_request, save_evaluation_request
from app.services.evidence import create_evidence, delete_evidence, list_evidence, update_evidence
from app.services.monitoring import get_monitoring, save_monitoring
from app.services.risk import delete_risk, get_risks, save_risk, update_risk
from app.services.control import delete_control, get_controls, save_control, update_control
from app.services.review import get_review, save_review
from app.services.rules import get_governance_rules, save_governance_rules
from app.services.rule_results import get_rule_result_history, get_rule_results, save_rule_results

app = FastAPI(
    title="AIGO Framework API",
    version="0.1.0",
    description="API for AIGO Framework Studio.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ai-systems")
def get_ai_systems(db: Session = Depends(get_db)):
    return list_ai_systems(db)


@app.post("/ai-systems", status_code=201)
def post_ai_system(data: AISystemCreate, db: Session = Depends(get_db)):
    return create_ai_system(db, data)


@app.get("/evidence")
def get_evidence_items(ai_system_id: str | None = None, db: Session = Depends(get_db)):
    return list_evidence(db, ai_system_id)


@app.post("/evidence", status_code=201)
def post_evidence(data: EvidenceCreate, db: Session = Depends(get_db)):
    return create_evidence(db, data)

@app.put("/evidence/{evidence_id}")
def put_evidence(evidence_id: str, data: EvidenceCreate, db: Session = Depends(get_db)):
    result = update_evidence(db, evidence_id, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return result


@app.delete("/evidence/{evidence_id}")
def remove_evidence(evidence_id: str, db: Session = Depends(get_db)):
    if not delete_evidence(db, evidence_id):
        raise HTTPException(status_code=404, detail="Evidence not found")
    return {"deleted": True, "id": evidence_id}


@app.get("/ai-systems/{ai_system_id}/classification")
def get_ai_system_classification(ai_system_id: str, db: Session = Depends(get_db)):
    return get_classification(db, ai_system_id) or {
        "ai_system_id": ai_system_id,
        "status": "NOT_STARTED",
        "assessmentType": "CLASSIFICATION",
        "applicable_domains": [],
        "requirements": [],
        "risk_considerations": None,
        "evaluation_scope": None,
        "assessmentResult": {
            "outcome": "NOT_ASSESSED",
            "summary": None,
            "rationale": None,
        },
    }


@app.put("/ai-systems/{ai_system_id}/classification")
def put_ai_system_classification(
    ai_system_id: str,
    data: AIClassificationCreate,
    db: Session = Depends(get_db),
):
    return save_classification(db, ai_system_id, data)


@app.delete("/ai-systems/{ai_system_id}/classification")
def delete_ai_system_classification(ai_system_id: str, db: Session = Depends(get_db)):
    if not delete_classification(db, ai_system_id):
        raise HTTPException(status_code=404, detail="Classification not found")
    return {"deleted": True, "ai_system_id": ai_system_id}


@app.get("/ai-systems/{ai_system_id}/evaluation")
def get_ai_system_evaluation(ai_system_id: str, db: Session = Depends(get_db)):
    return get_evaluation_request(db, ai_system_id) or {
        "ai_system_id": ai_system_id,
        "status": "NOT_STARTED",
        "assessmentType": "CONTROL",
    }


@app.put("/ai-systems/{ai_system_id}/evaluation")
def put_ai_system_evaluation(
    ai_system_id: str,
    data: EvaluationRequestCreate,
    db: Session = Depends(get_db),
):
    return save_evaluation_request(db, ai_system_id, data)


@app.get("/ai-systems/{ai_system_id}/review")
def get_ai_system_review(ai_system_id: str, db: Session = Depends(get_db)):
    return get_review(db, ai_system_id)


@app.put("/ai-systems/{ai_system_id}/review")
def put_ai_system_review(
    ai_system_id: str,
    data: ReviewCreate,
    db: Session = Depends(get_db),
):
    return save_review(db, ai_system_id, data)


@app.get("/ai-systems/{ai_system_id}/approval")
def get_ai_system_approval(ai_system_id: str, db: Session = Depends(get_db)):
    return get_approval(db, ai_system_id)


@app.put("/ai-systems/{ai_system_id}/approval")
def put_ai_system_approval(
    ai_system_id: str,
    data: ApprovalCreate,
    db: Session = Depends(get_db),
):
    return save_approval(db, ai_system_id, data)


@app.get("/ai-systems/{ai_system_id}/rules")
def get_ai_system_rules(ai_system_id: str, db: Session = Depends(get_db)):
    return get_governance_rules(db, ai_system_id)


@app.put("/ai-systems/{ai_system_id}/rules")
def put_ai_system_rules(
    ai_system_id: str,
    data: GovernanceRulesUpdate,
    db: Session = Depends(get_db),
):
    return save_governance_rules(db, ai_system_id, data)


@app.get("/ai-systems/{ai_system_id}/rule-results")
def get_ai_system_rule_results(ai_system_id: str, db: Session = Depends(get_db)):
    return {"results": get_rule_results(db, ai_system_id)}


@app.get("/ai-systems/{ai_system_id}/rule-results/{rule_id}/history")
def get_ai_system_rule_result_history(
    ai_system_id: str,
    rule_id: str,
    db: Session = Depends(get_db),
):
    return {"history": get_rule_result_history(db, ai_system_id, rule_id)}


@app.put("/ai-systems/{ai_system_id}/rule-results")
def put_ai_system_rule_results(
    ai_system_id: str,
    data: RuleResultsUpdate,
    db: Session = Depends(get_db),
):
    return {"results": save_rule_results(db, ai_system_id, data)}


@app.get("/ai-systems/{ai_system_id}/monitoring")
def get_ai_system_monitoring(ai_system_id: str, db: Session = Depends(get_db)):
    return get_monitoring(db, ai_system_id) or {
        "aiSystemId": ai_system_id,
        "objectType": "MONITORING",
        "objectVersion": "1.0",
        "schemaVersion": "0.1",
        "status": "DRAFT",
        "monitoringObjectives": [],
        "indicators": [],
    }


@app.put("/ai-systems/{ai_system_id}/monitoring")
def put_ai_system_monitoring(
    ai_system_id: str,
    data: MonitoringCreate,
    db: Session = Depends(get_db),
):
    return save_monitoring(db, ai_system_id, data)


@app.get("/ai-systems/{ai_system_id}/risk")
def get_ai_system_risks(ai_system_id: str, db: Session = Depends(get_db)):
    return get_risks(db, ai_system_id)


@app.put("/ai-systems/{ai_system_id}/risk")
def put_ai_system_risk(
    ai_system_id: str,
    data: RiskCreate,
    db: Session = Depends(get_db),
):
    return save_risk(db, ai_system_id, data)


@app.put("/ai-systems/{ai_system_id}/risk/{risk_id}")
def update_ai_system_risk(
    ai_system_id: str,
    risk_id: str,
    data: RiskCreate,
    db: Session = Depends(get_db),
):
    result = update_risk(db, ai_system_id, risk_id, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Risk not found")
    return result


@app.delete("/ai-systems/{ai_system_id}/risk/{risk_id}")
def delete_ai_system_risk(
    ai_system_id: str,
    risk_id: str,
    db: Session = Depends(get_db),
):
    if not delete_risk(db, ai_system_id, risk_id):
        raise HTTPException(status_code=404, detail="Risk not found")
    return {"deleted": True, "id": risk_id}

@app.get("/ai-systems/{ai_system_id}/control")
def get_ai_system_controls(ai_system_id: str, db: Session = Depends(get_db)):
    return get_controls(db, ai_system_id)


@app.put("/ai-systems/{ai_system_id}/control")
def put_ai_system_control(
    ai_system_id: str,
    data: ControlCreate,
    db: Session = Depends(get_db),
):
    return save_control(db, ai_system_id, data)


@app.put("/ai-systems/{ai_system_id}/control/{control_id}")
def update_ai_system_control(
    ai_system_id: str,
    control_id: str,
    data: ControlCreate,
    db: Session = Depends(get_db),
):
    result = update_control(db, ai_system_id, control_id, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Control not found")
    return result


@app.delete("/ai-systems/{ai_system_id}/control/{control_id}")
def delete_ai_system_control(
    ai_system_id: str,
    control_id: str,
    db: Session = Depends(get_db),
):
    if not delete_control(db, ai_system_id, control_id):
        raise HTTPException(status_code=404, detail="Control not found")
    return {"deleted": True, "id": control_id}




















from app.api.assurance import router as assurance_router

app.include_router(assurance_router)

from app.schemas.change import ChangeCreate
from app.services.change import delete_change, get_changes, save_change, update_change

@app.get("/ai-systems/{ai_system_id}/change")
def get_ai_system_changes(ai_system_id: str, db: Session = Depends(get_db)):
    return get_changes(db, ai_system_id)


@app.put("/ai-systems/{ai_system_id}/change")
def put_ai_system_change(
    ai_system_id: str,
    data: ChangeCreate,
    db: Session = Depends(get_db),
):
    return save_change(db, ai_system_id, data)


@app.put("/ai-systems/{ai_system_id}/change/{change_id}")
def update_ai_system_change(
    ai_system_id: str,
    change_id: str,
    data: ChangeCreate,
    db: Session = Depends(get_db),
):
    result = update_change(db, ai_system_id, change_id, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Change not found")
    return result


@app.delete("/ai-systems/{ai_system_id}/change/{change_id}")
def delete_ai_system_change(
    ai_system_id: str,
    change_id: str,
    db: Session = Depends(get_db),
):
    if not delete_change(db, ai_system_id, change_id):
        raise HTTPException(status_code=404, detail="Change not found")
    return {"deleted": True, "id": change_id}
from app.schemas.incident import IncidentCreate
from app.services.incident import (
    delete_incident,
    get_incidents,
    save_incident,
    update_incident,
)

@app.get("/ai-systems/{ai_system_id}/incidents")
def get_ai_system_incidents(
    ai_system_id: str,
    db: Session = Depends(get_db),
):
    return get_incidents(db, ai_system_id)


@app.put("/ai-systems/{ai_system_id}/incidents")
def put_ai_system_incident(
    ai_system_id: str,
    data: IncidentCreate,
    db: Session = Depends(get_db),
):
    return save_incident(db, ai_system_id, data)


@app.put("/ai-systems/{ai_system_id}/incidents/{incident_id}")
def update_ai_system_incident(
    ai_system_id: str,
    incident_id: str,
    data: IncidentCreate,
    db: Session = Depends(get_db),
):
    result = update_incident(db, ai_system_id, incident_id, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@app.delete("/ai-systems/{ai_system_id}/incidents/{incident_id}")
def delete_ai_system_incident(
    ai_system_id: str,
    incident_id: str,
    db: Session = Depends(get_db),
):
    if not delete_incident(db, ai_system_id, incident_id):
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"deleted": True, "id": incident_id}


from app.schemas.user import UserCreate
from app.services.user import create_user, delete_user, get_users, update_user

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    return get_users(db)

@app.post("/users", status_code=201)
def post_user(data: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, data)

@app.put("/users/{user_id}")
def put_user(user_id: str, data: UserCreate, db: Session = Depends(get_db)):
    from uuid import UUID
    try:
        parsed_id = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    result = update_user(db, parsed_id, data)
    if result is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return result

@app.delete("/users/{user_id}")
def remove_user(user_id: str, db: Session = Depends(get_db)):
    from uuid import UUID
    try:
        parsed_id = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    try:
        deleted = delete_user(db, parsed_id)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    if not deleted:
        raise HTTPException(status_code=404, detail="Person not found")
    return {"deleted": True, "id": user_id}


from app.schemas.responsibility import ResponsibilityAssignmentCreate
from app.services.responsibility import create_responsibility, get_responsibilities

@app.get("/ai-systems/{ai_system_id}/responsibilities")
def list_responsibilities(ai_system_id: str, db: Session = Depends(get_db)):
    return get_responsibilities(db, ai_system_id)

@app.post("/ai-systems/{ai_system_id}/responsibilities", status_code=201)
def post_responsibility(ai_system_id: str, data: ResponsibilityAssignmentCreate, db: Session = Depends(get_db)):
    return create_responsibility(db, ai_system_id, data)
