from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import connect
from routes import users, admin, drivers, trips, ws_routes, passanger, vehicles
import logging_config  # Initialize logging

logger = logging_config.logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup")
    connect()
    yield
    logger.info("Application shutdown")

app = FastAPI(
    title="K3k3 Transport API",
    lifespan=lifespan,
    version='0.0.1v',
    description="Ride-hailing backend API with real-time updates"
)

# Register all route routers
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(drivers.router)
app.include_router(trips.router)
app.include_router(passanger.router)
app.include_router(ws_routes.router)
app.include_router(vehicles.router)

# Add health check endpoint for frontend error handling
@app.get("/health")
async def health_check():
    """Health check endpoint for frontend to verify backend is running"""
    return {
        "status": "healthy",
        "timestamp": "2024-12-16T00:00:00Z",
        "version": "0.0.1v",
        "database": "connected"
    }

@app.get("/api/v1/health")
async def api_health_check():
    """API health check endpoint for frontend error handling"""
    return {
        "status": "healthy",
        "timestamp": "2024-12-16T00:00:00Z",
        "version": "0.0.1v",
        "database": "connected",
        "endpoints": {
            "trips": "available",
            "riders": "available", 
            "users": "available",
            "admin": "available"
        }
    }

logger.info("All routes registered successfully")


if __name__ == '__main__':
    import uvicorn
    logger.info("Starting K3k3 Transport API server...")
    uvicorn.run("main:app", host="localhost", port=8810, reload=True)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8810, reload=True)