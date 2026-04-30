from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session

import models


def get_or_create_user(db: Session, *, name: str, acf2_id: str) -> models.User:
    existing = db.query(models.User).filter(models.User.acf2_id == acf2_id).one_or_none()
    if existing:
        # Keep name fresh if user typed a newer variant.
        if name and existing.name != name:
            existing.name = name
            db.add(existing)
            db.flush()
        return existing

    user = models.User(name=name, acf2_id=acf2_id)
    db.add(user)
    db.flush()
    return user


def list_roles(db: Session) -> List[models.Role]:
    return db.query(models.Role).order_by(models.Role.name.asc()).all()


def get_role(db: Session, role_id: int) -> Optional[models.Role]:
    return db.query(models.Role).filter(models.Role.id == role_id).one_or_none()


def get_role_by_name(db: Session, name: str) -> Optional[models.Role]:
    return db.query(models.Role).filter(models.Role.name == name).one_or_none()


def create_role(
    db: Session,
    *,
    name: str,
    description: str,
    primary_owner: str,
    key_technology: str,
    permissions: List[str],
) -> models.Role:
    role = models.Role(
        name=name,
        description=description or "",
        primary_owner=primary_owner or "",
        key_technology=key_technology or "",
    )
    role.set_permissions(permissions or [])
    db.add(role)
    db.flush()
    return role


def create_access_request(
    db: Session,
    *,
    user: models.User,
    manager: models.User,
    request_type: str,
    role: Optional[models.Role],
    requested_role_name: str,
    requested_role_description: str,
    requested_primary_owner: str,
    requested_key_technology: str,
    requested_permissions: List[str],
) -> models.AccessRequest:
    req = models.AccessRequest(
        user_id=user.id,
        manager_id=manager.id,
        role_id=role.id if role else None,
        request_type=request_type,
        status="Pending",
        requested_role_name=requested_role_name or "",
        requested_role_description=requested_role_description or "",
        requested_primary_owner=requested_primary_owner or "",
        requested_key_technology=requested_key_technology or "",
    )
    req.set_requested_permissions(requested_permissions or [])
    db.add(req)
    db.flush()
    return req


def list_requests(db: Session) -> List[models.AccessRequest]:
    return db.query(models.AccessRequest).order_by(models.AccessRequest.created_at.desc()).all()


def get_request(db: Session, request_id: int) -> Optional[models.AccessRequest]:
    return db.query(models.AccessRequest).filter(models.AccessRequest.id == request_id).one_or_none()

