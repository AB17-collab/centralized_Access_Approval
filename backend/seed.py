from __future__ import annotations

from sqlalchemy.orm import Session

import crud
from models import PERSONA_PERMISSIONS


def seed_roles(db: Session) -> None:
    for persona_name, perms in PERSONA_PERMISSIONS.items():
        existing = crud.get_role_by_name(db, persona_name)
        if existing:
            continue
        crud.create_role(
            db,
            name=persona_name,
            description=f"Seeded persona role: {persona_name}",
            primary_owner="Access Governance",
            key_technology="Persona",
            permissions=perms,
        )

