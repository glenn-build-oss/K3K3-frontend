from fastapi import APIRouter, Depends, HTTPException   
from database import get_db
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from models.models import Admin, User, Rider, RoleType
from schemas import admin
from utils.hashcode import hash_password
import logging
from typing import List, Dict, Any
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/", response_model=List[admin.AdminRead])
def get_admins(db:Session = Depends(get_db)):
    """Retrieve Admins"""
    try:
        return db.query(Admin).all()
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving admins: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        logger.error(f"Unexpected error retrieving admins: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@router.post("/register/", response_model=admin.AdminRead)
def create_admin(admin_data: admin.AdminCreate, db: Session = Depends(get_db)):
    """Register a new admin user with full admin privileges."""
    try:
        # Check if user already exists
        db_user = db.query(User).filter(User.email == admin_data.email).first()
        if db_user:
            logger.warning(f"Admin registration attempt with existing email: {admin_data.email}")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        try:
            hashed_pw = hash_password(admin_data.password)
        except Exception as e:
            logger.error(f"Password hashing failed: {e}")
            raise HTTPException(status_code=500, detail="Password processing failed")
        
        # Create user
        new_admin = Admin(
            name=admin_data.name,
            email=admin_data.email,
            phone=admin_data.phone,
            password=hashed_pw,
            role_type=admin_data.role_type,
            gender=admin_data.gender,
            is_active=admin_data.is_active
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        # Create admin role
    
        
        # Create admin entry
        # try:
        #     new_admin = Admin(user_id=new_user.id)
        #     db.add(new_admin)
        #     db.commit()
        #     db.refresh(new_admin)
        # except Exception as e:
        #     db.rollback()
        #     logger.error(f"Failed to create admin entry for user {new_user.id}: {e}")
        #     raise HTTPException(status_code=500, detail="Failed to create admin entry")
        
        logger.info(f"Admin registered successfully: {admin_data.email}")
        return new_admin
    
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error during admin registration: {e}")
        raise HTTPException(status_code=400, detail="Registration failed: Invalid data or duplicate entry")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during admin registration: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error during admin registration: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

# --------------------------------------------
# Update admin endpoint
# --------------------------------------------
@router.put("/{admin_id}", response_model=admin.AdminRead)
def update_admin(admin_id: int, admin_data: admin.AdminUpdate, db: Session = Depends(get_db)):
    """Update admin information by ID."""
    try:
        admin_obj = db.query(Admin).filter(Admin.id == admin_id).first()
        if not admin_obj:
            logger.warning(f"Admin update attempt for non-existent ID: {admin_id}")
            raise HTTPException(status_code=404, detail="Admin not found")
        
        # Update fields
        admin_obj.name = admin_data.name #type: ignore
        admin_obj.email = admin_data.email #type: ignore
        admin_obj.phone = admin_data.phone #type: ignore
        if admin_data.password:
            try:
                admin_obj.password = hash_password(admin_data.password) #type: ignore
            except Exception as e:
                logger.error(f"Password hashing failed during admin update: {e}")
                raise HTTPException(status_code=500, detail="Password processing failed")
        admin_obj.role_type = admin_data.role_type #type: ignore
        db.commit()
        db.refresh(admin_obj)
        logger.info(f"Admin updated successfully: {admin_id}")
        return admin_obj
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error during admin update: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

# --------------------------------------------
# Rider Application Management
# --------------------------------------------

def generate_rider_id(db: Session) -> str:
    """Generate unique rider ID in K3D-XXXXX format."""
    try:
        # Get highest existing rider ID
        last_rider = db.query(Rider).order_by(Rider.id.desc()).first()
        
        if last_rider and last_rider.public_id and last_rider.public_id.startswith('K3D-'):
            # Extract numeric part and increment
            last_num = int(last_rider.public_id.split('-')[1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f"K3D-{str(new_num).zfill(5)}"
    except Exception as e:
        logger.error(f"Error generating rider ID: {e}")
        # Fallback to timestamp-based ID
        return f"K3D-{str(int(datetime.now().timestamp()))[-5:]}"

def create_rider_from_application(application_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
    """Create rider credentials in database from approved application."""
    try:
        # 1. Generate rider ID
        rider_id = generate_rider_id(db)
        
        # 2. Format DOB as default password (DD-MM-YYYY)
        dob_date = datetime.strptime(application_data['dateOfBirth'], '%Y-%m-%d')
        default_password = dob_date.strftime('%d-%m-%Y')
        
        # 3. Hash the default password
        hashed_password = hash_password(default_password)
        
        # 4. Create User record
        new_user = User(
            name=application_data['name'],
            email=application_data['email'],
            phone=application_data['phone'],
            password=hashed_password,
            role_type=RoleType.rider,
            is_active=True,
            gender=application_data.get('gender', 'prefer_not_to_say')
        )
        db.add(new_user)
        db.flush()  # Get the ID without committing
        
        # 5. Create Rider record
        new_rider = Rider(
            user_id=new_user.id,
            public_id=rider_id,
            is_available=False,  # Not available until first login
            rating=5.0,
            rating_count=0,
            gender=application_data.get('gender', 'prefer_not_to_say')
        )
        db.add(new_rider)
        
        # 6. Commit both records
        db.commit()
        db.refresh(new_user)
        db.refresh(new_rider)
        
        logger.info(f"Rider created successfully: {rider_id} for user {new_user.email}")
        
        return {
            'user_id': new_user.id,
            'rider_id': rider_id,
            'email': application_data['email'],
            'name': application_data['name'],
            'default_password': default_password,
            'phone': application_data['phone']
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create rider from application: {e}")
        raise HTTPException(status_code=500, detail="Failed to create rider account")

@router.post("/approve-rider/{application_id}")
async def approve_rider_application(application_id: str, db: Session = Depends(get_db)):
    """Approve rider application and create database credentials."""
    try:
        # For now, get application from localStorage (in production, this would be from database)
        # This is a temporary solution - in production, applications would be stored in database
        logger.info(f"Approving rider application: {application_id}")
        
        # Mock application data - in production, fetch from database
        application_data = {
            'name': 'Test Rider',
            'email': 'test.rider@k3k3.com',
            'phone': '+233501234567',
            'dateOfBirth': '1990-05-15',
            'gender': 'male',
            'vehicleInfo': {
                'vehicle_type': 'car',
                'brand': 'Toyota',
                'model': 'Camry',
                'year': '2020',
                'license_plate': 'GT-1234-XYZ'
            }
        }
        
        # Create rider credentials
        rider_credentials = create_rider_from_application(application_data, db)
        
        logger.info(f"Rider approved successfully: {rider_credentials['rider_id']}")
        
        return {
            "message": "Rider approved and credentials created",
            "rider_id": rider_credentials['rider_id'],
            "email": rider_credentials['email'],
            "name": rider_credentials['name'],
            "default_password": rider_credentials['default_password']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to approve rider application {application_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to approve rider application")

@router.get("/applications")
def get_rider_applications(db: Session = Depends(get_db)):
    """Get all rider applications (mock implementation)."""
    try:
        # Mock applications data - in production, fetch from database
        applications = [
            {
                "id": "APP-001",
                "name": "Kofi Osei",
                "email": "kofi.osei@gmail.com",
                "phone": "+233509876543",
                "dateOfBirth": "1990-05-15",
                "gender": "male",
                "vehicle_type": "car",
                "vehicle_brand": "Toyota",
                "vehicle_model": "Camry",
                "license_plate": "GT-1234-XYZ",
                "status": "pending_review",
                "submittedAt": "2024-12-16T10:30:00Z"
            },
            {
                "id": "APP-002", 
                "name": "Ama Mensah",
                "email": "ama.mensah@gmail.com",
                "phone": "+233505555555",
                "dateOfBirth": "1985-08-22",
                "gender": "female",
                "vehicle_type": "motorcycle",
                "vehicle_brand": "Honda",
                "vehicle_model": "CBR",
                "license_plate": "GT-MOTO-001",
                "status": "pending_review",
                "submittedAt": "2024-12-16T11:15:00Z"
            }
        ]
        
        return applications
        
    except Exception as e:
        logger.error(f"Error retrieving rider applications: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve applications")