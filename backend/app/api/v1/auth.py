from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.logging import log_security_event
from app.models.user import User
from app.models.settings import UserSettings
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default settings for user
    default_settings = UserSettings(user_id=user.id)
    db.add(default_settings)
    db.commit()

    log_security_event("USER_REGISTERED", user.id, f"Email: {user.email}")
    access_token = create_access_token(user.id)
    return Token(
        access_token=access_token,
        user_id=user.id,
        email=user.email
    )

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive."
        )

    log_security_event("USER_LOGIN", user.id, "Successful login.")
    access_token = create_access_token(user.id)
    return Token(
        access_token=access_token,
        user_id=user.id,
        email=user.email
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Cascading permanent deletion of user account and all personal memories, conversations, and tasks.
    """
    user_id = user.id
    db.delete(user)
    db.commit()
    log_security_event("ACCOUNT_DELETED", user_id, "Cascaded erasure completed.")
    return None
