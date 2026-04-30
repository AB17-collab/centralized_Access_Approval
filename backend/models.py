from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


# Hardcoded persona mapping for hackathon-style access consolidation.
# Keys are role/persona names; values are default permissions.
PERSONA_PERMISSIONS: Dict[str, List[str]] = {
    "Backend_Developer": ["Database_Access", "Jira", "OpenShift"],
    "Data_Engineer": ["Kafka", "Splunk", "Database_Access", "Airflow"],
    "Platform_Engineer": ["OpenShift", "Terraform", "Kubernetes_Admin"],
    "Developer_Productivity": ["GitHub_Copilot", "Jira", "Confluence"],
    "Observability_Engineer": ["Splunk", "Grafana", "PagerDuty"],
}


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    acf2_id: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    primary_owner: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    key_technology: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    permissions_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")

    requests: Mapped[List["AccessRequest"]] = relationship(back_populates="role")

    def set_permissions(self, permissions: List[str]) -> None:
        self.permissions_json = json.dumps(permissions)

    def get_permissions(self) -> List[str]:
        try:
            data = json.loads(self.permissions_json or "[]")
            if isinstance(data, list):
                return [str(x) for x in data]
        except Exception:
            pass
        return []


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    manager_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    role_id: Mapped[Optional[int]] = mapped_column(ForeignKey("roles.id"), nullable=True)

    request_type: Mapped[str] = mapped_column(String(16), nullable=False)  # create|update|copy
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="Pending")

    requested_role_name: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    requested_role_description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    requested_primary_owner: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    requested_key_technology: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    requested_permissions_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")

    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    manager: Mapped["User"] = relationship(foreign_keys=[manager_id])
    role: Mapped[Optional["Role"]] = relationship(back_populates="requests")

    def set_requested_permissions(self, permissions: List[str]) -> None:
        self.requested_permissions_json = json.dumps(permissions)

    def get_requested_permissions(self) -> List[str]:
        try:
            data = json.loads(self.requested_permissions_json or "[]")
            if isinstance(data, list):
                return [str(x) for x in data]
        except Exception:
            pass
        return []


def role_name_from_persona(persona: str) -> str:
    # Keep a stable display name for the UI (no spaces; easy to validate).
    return persona


def suggest_persona(description: str) -> Dict[str, Any]:
    """
    Mock 'AI' suggestion: simple keyword scoring against hardcoded personas.
    Returns { suggested_role_name, permissions, rationale }.
    """
    text = (description or "").lower()
    if not text.strip():
        persona = "Backend_Developer"
        return {
            "suggested_role_name": role_name_from_persona(persona),
            "permissions": PERSONA_PERMISSIONS[persona],
            "rationale": "Empty description; defaulted to Backend_Developer persona.",
        }

    keywords = {
        "database": ["database", "db", "sql", "postgres", "mysql", "oracle"],
        "kafka": ["kafka", "stream", "streaming", "event", "pubsub"],
        "splunk": ["splunk", "siem", "logs", "logging", "observability"],
        "openshift": ["openshift", "kubernetes", "k8s", "cluster"],
        "copilot": ["copilot", "ai coding", "autocomplete", "developer productivity"],
        "terraform": ["terraform", "iac", "infrastructure as code"],
        "airflow": ["airflow", "dag", "etl", "pipeline"],
        "grafana": ["grafana", "metrics", "dashboards"],
    }

    persona_rules = {
        "Backend_Developer": ["database", "openshift"],
        "Data_Engineer": ["kafka", "airflow", "database"],
        "Platform_Engineer": ["openshift", "terraform"],
        "Developer_Productivity": ["copilot"],
        "Observability_Engineer": ["splunk", "grafana"],
    }

    # Compute feature hits.
    hits: Dict[str, int] = {}
    for feature, terms in keywords.items():
        hits[feature] = sum(1 for t in terms if t in text)

    best_persona = "Backend_Developer"
    best_score = -1
    for persona, needed_features in persona_rules.items():
        score = sum(hits.get(f, 0) for f in needed_features)
        if score > best_score:
            best_persona = persona
            best_score = score

    perms = PERSONA_PERMISSIONS.get(best_persona, PERSONA_PERMISSIONS["Backend_Developer"])
    matched = [f for f in persona_rules.get(best_persona, []) if hits.get(f, 0) > 0]
    rationale = (
        f"Matched keywords for {', '.join(matched) or 'no strong keywords'}; "
        f"suggesting {best_persona} persona."
    )

    return {
        "suggested_role_name": role_name_from_persona(best_persona),
        "permissions": perms,
        "rationale": rationale,
    }

