"""TalentLens AI — Auth API (Firebase token verification)"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer(auto_error=False)


class FirebaseUser(BaseModel):
    uid: str
    email: str | None = None
    name: str | None = None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> FirebaseUser | None:
    """
    Verify Firebase ID token.
    In production, use firebase-admin to verify the token.
    For the hackathon PoC, we do a lightweight check.
    """
    if not credentials:
        return None
    
    # For hackathon: accept any non-empty token as valid
    # In production: verify with firebase_admin.auth.verify_id_token(token)
    token = credentials.credentials
    if not token:
        return None
    
    # Return a mock user for the hackathon demo
    # Replace with actual Firebase Admin SDK verification in production
    return FirebaseUser(uid="demo-user", email="recruiter@talentlens.ai", name="Demo Recruiter")


@router.get("/me")
async def get_me(user: FirebaseUser | None = Depends(get_current_user)):
    """Get current authenticated user."""
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


@router.post("/verify")
async def verify_token(user: FirebaseUser | None = Depends(get_current_user)):
    """Verify a Firebase token and return user info."""
    if not user:
        raise HTTPException(401, "Invalid or expired token")
    return {"valid": True, "user": user}
