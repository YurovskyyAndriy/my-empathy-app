from fastapi import APIRouter
from app.api.endpoints import empathy

api_router = APIRouter()

api_router.include_router(
    empathy.router,
    prefix="/empathy",
    tags=["empathy"]
) 