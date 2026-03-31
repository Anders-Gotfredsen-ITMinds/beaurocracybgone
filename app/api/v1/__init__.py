from fastapi import APIRouter

from app.api.v1.routes.analyze import router as analyze_router
from app.api.v1.routes.factcheck import router as factcheck_router

v1_router = APIRouter(prefix="/v1")
v1_router.include_router(analyze_router, prefix="/analyze", tags=["analyze"])
v1_router.include_router(factcheck_router, prefix="/factcheck", tags=["factcheck"])
