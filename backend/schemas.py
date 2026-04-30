from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


RequestType = Literal["create", "update", "copy"]
RequestStatus = Literal["Pending", "Approved"]


class UserIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    acf2_id: str = Field(min_length=2, max_length=32)


class RoleOut(BaseModel):
    id: int
    name: str
    description: str
    primary_owner: str
    key_technology: str
    permissions: List[str]


class SuggestRoleIn(BaseModel):
    description: str = Field(default="")


class SuggestRoleOut(BaseModel):
    suggested_role_name: str
    permissions: List[str]
    rationale: str


class AccessRequestIn(BaseModel):
    user: UserIn
    manager: UserIn

    request_type: RequestType

    # Either select an existing role, or provide role metadata.
    selected_role_id: Optional[int] = None
    role_name: str = Field(default="", max_length=160)
    role_description: str = Field(default="", max_length=4000)
    primary_owner: str = Field(default="", max_length=160)
    key_technology: str = Field(default="", max_length=80)
    permissions: List[str] = Field(default_factory=list)


class AccessRequestOut(BaseModel):
    id: int
    status: RequestStatus
    request_type: RequestType
    created_at: datetime

    user: UserIn
    manager: UserIn

    role_id: Optional[int]
    role_name: str
    role_description: str
    primary_owner: str
    key_technology: str
    permissions: List[str]


class UpdateRequestStatusIn(BaseModel):
    status: RequestStatus

