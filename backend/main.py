from __future__ import annotations

from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import crud
import models
import schemas
import seed
from database import Base, engine, get_db


app = FastAPI(title="AI-Powered Access Approval Orchestrator", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    # Dev-friendly: allow CRA/Vite on other localhost ports (e.g. 3001).
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    Base.metadata.create_all(bind=engine)
    # Seed default roles/personas
    db = next(get_db())
    try:
        seed.seed_roles(db)
        db.commit()
    finally:
        db.close()


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/suggest-role", response_model=schemas.SuggestRoleOut)
def suggest_role(payload: schemas.SuggestRoleIn) -> schemas.SuggestRoleOut:
    suggestion = models.suggest_persona(payload.description)
    return schemas.SuggestRoleOut(**suggestion)


@app.get("/roles", response_model=List[schemas.RoleOut])
def list_roles(db: Session = Depends(get_db)) -> List[schemas.RoleOut]:
    roles = crud.list_roles(db)
    return [
        schemas.RoleOut(
            id=r.id,
            name=r.name,
            description=r.description,
            primary_owner=r.primary_owner,
            key_technology=r.key_technology,
            permissions=r.get_permissions(),
        )
        for r in roles
    ]


@app.post("/request-access", response_model=schemas.AccessRequestOut)
def request_access(payload: schemas.AccessRequestIn, db: Session = Depends(get_db)) -> schemas.AccessRequestOut:
    if not payload.user.acf2_id.strip() or not payload.manager.acf2_id.strip():
        raise HTTPException(status_code=400, detail="User and Manager ACF2 IDs are required.")

    user = crud.get_or_create_user(db, name=payload.user.name, acf2_id=payload.user.acf2_id)
    manager = crud.get_or_create_user(db, name=payload.manager.name, acf2_id=payload.manager.acf2_id)

    role = None
    requested_role_name = payload.role_name
    requested_role_description = payload.role_description
    requested_primary_owner = payload.primary_owner
    requested_key_technology = payload.key_technology
    requested_permissions = payload.permissions

    if payload.selected_role_id is not None:
        role = crud.get_role(db, payload.selected_role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Selected role not found.")
        # Snapshot role into the request for auditability
        requested_role_name = role.name
        requested_role_description = role.description
        requested_primary_owner = role.primary_owner
        requested_key_technology = role.key_technology
        requested_permissions = role.get_permissions()
    else:
        if not payload.role_name.strip():
            raise HTTPException(status_code=400, detail="Role name is required when not selecting an existing role.")

        # For create/copy/update in prototype: create a role record if name doesn't exist
        existing = crud.get_role_by_name(db, payload.role_name)
        if existing:
            role = existing
        else:
            role = crud.create_role(
                db,
                name=payload.role_name,
                description=payload.role_description,
                primary_owner=payload.primary_owner,
                key_technology=payload.key_technology,
                permissions=payload.permissions,
            )

    req = crud.create_access_request(
        db,
        user=user,
        manager=manager,
        request_type=payload.request_type,
        role=role,
        requested_role_name=requested_role_name,
        requested_role_description=requested_role_description,
        requested_primary_owner=requested_primary_owner,
        requested_key_technology=requested_key_technology,
        requested_permissions=requested_permissions,
    )
    db.commit()
    db.refresh(req)

    return schemas.AccessRequestOut(
        id=req.id,
        status=req.status,  # type: ignore[arg-type]
        request_type=req.request_type,  # type: ignore[arg-type]
        created_at=req.created_at,
        user=schemas.UserIn(name=user.name, acf2_id=user.acf2_id),
        manager=schemas.UserIn(name=manager.name, acf2_id=manager.acf2_id),
        role_id=req.role_id,
        role_name=req.requested_role_name,
        role_description=req.requested_role_description,
        primary_owner=req.requested_primary_owner,
        key_technology=req.requested_key_technology,
        permissions=req.get_requested_permissions(),
    )


@app.get("/requests", response_model=List[schemas.AccessRequestOut])
def list_requests(db: Session = Depends(get_db)) -> List[schemas.AccessRequestOut]:
    reqs = crud.list_requests(db)
    out: List[schemas.AccessRequestOut] = []
    for r in reqs:
        out.append(
            schemas.AccessRequestOut(
                id=r.id,
                status=r.status,  # type: ignore[arg-type]
                request_type=r.request_type,  # type: ignore[arg-type]
                created_at=r.created_at,
                user=schemas.UserIn(name=r.user.name, acf2_id=r.user.acf2_id),
                manager=schemas.UserIn(name=r.manager.name, acf2_id=r.manager.acf2_id),
                role_id=r.role_id,
                role_name=r.requested_role_name,
                role_description=r.requested_role_description,
                primary_owner=r.requested_primary_owner,
                key_technology=r.requested_key_technology,
                permissions=r.get_requested_permissions(),
            )
        )
    return out


@app.patch("/requests/{request_id}/status", response_model=schemas.AccessRequestOut)
def update_request_status(
    request_id: int,
    payload: schemas.UpdateRequestStatusIn,
    db: Session = Depends(get_db),
) -> schemas.AccessRequestOut:
    req = crud.get_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    req.status = payload.status
    db.add(req)
    db.commit()
    db.refresh(req)

    return schemas.AccessRequestOut(
        id=req.id,
        status=req.status,  # type: ignore[arg-type]
        request_type=req.request_type,  # type: ignore[arg-type]
        created_at=req.created_at,
        user=schemas.UserIn(name=req.user.name, acf2_id=req.user.acf2_id),
        manager=schemas.UserIn(name=req.manager.name, acf2_id=req.manager.acf2_id),
        role_id=req.role_id,
        role_name=req.requested_role_name,
        role_description=req.requested_role_description,
        primary_owner=req.requested_primary_owner,
        key_technology=req.requested_key_technology,
        permissions=req.get_requested_permissions(),
    )

