from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserCreate, UserResponse, UserWithNotes, NoteCreate, NoteUpdate, NoteResponse, NoteWithDecrypted, LoginRequest, LoginResponse
from app.services import UserService, NoteService

router = APIRouter(tags=["Users & Notes"], responses={404: {"description": "User or note not found"}, 409: {"description": "Conflict"}})


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    user_service = UserService(db)
    existing = user_service.get_user_by_alias(user_data.alias)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"User '{user_data.alias}' already exists")
    return user_service.create_user(user_data)


@router.post("/login", response_model=LoginResponse)
async def login_user(login_data: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user_service = UserService(db)
    user = user_service.get_user_by_alias(login_data.alias)
    if not user:
        return LoginResponse(success=False, message="User not found")
    if not user_service.verify_password(user, login_data.password):
        return LoginResponse(success=False, message="Invalid password")
    user_service.update_last_accessed(user.id)
    return LoginResponse(success=True, message="Login successful", user=user)


@router.get("/{alias}", response_model=UserWithNotes)
async def get_user_with_notes(alias: str, db: Session = Depends(get_db)) -> UserWithNotes:
    user_service = UserService(db)
    note_service = NoteService(db)
    user = user_service.get_user_by_alias(alias)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{alias}' not found")
    notes = note_service.get_user_notes(user.id)
    return UserWithNotes(id=user.id, alias=user.alias, encrypted_alias=user.encrypted_alias, created_at=user.created_at, last_accessed_at=user.last_accessed_at, notes=notes)


@router.post("/{alias}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(alias: str, note_data: NoteCreate, password: str, db: Session = Depends(get_db)) -> NoteResponse:
    user_service = UserService(db)
    note_service = NoteService(db)
    user = user_service.get_user_by_alias(alias)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{alias}' not found")
    if not user_service.verify_password(user, password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    return note_service.create_note(user.id, note_data, password)


@router.get("/{alias}/notes/{note_id}", response_model=NoteWithDecrypted)
async def get_note(alias: str, note_id: int, password: str, db: Session = Depends(get_db)) -> NoteWithDecrypted:
    user_service = UserService(db)
    note_service = NoteService(db)
    user = user_service.get_user_by_alias(alias)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{alias}' not found")
    if not user_service.verify_password(user, password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    note = note_service.get_note_by_id(note_id)
    if not note or note.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Note {note_id} not found")
    decrypted_title = note_service.decrypt_note_title(note, password)
    decrypted_content = note_service.decrypt_note_content(note, password)
    return NoteWithDecrypted(id=note.id, user_id=note.user_id, encrypted_title=note.encrypted_title, encrypted_content=note.encrypted_content, content_hash=note.content_hash, created_at=note.created_at, updated_at=note.updated_at, decrypted_title=decrypted_title, decrypted_content=decrypted_content)


@router.put("/{alias}/notes/{note_id}", response_model=NoteResponse)
async def update_note(alias: str, note_id: int, note_data: NoteUpdate, password: str, db: Session = Depends(get_db)) -> NoteResponse:
    user_service = UserService(db)
    note_service = NoteService(db)
    user = user_service.get_user_by_alias(alias)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{alias}' not found")
    if not user_service.verify_password(user, password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    note = note_service.get_note_by_id(note_id)
    if not note or note.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Note {note_id} not found")
    if note_data.previous_hash and note.content_hash != note_data.previous_hash:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Note modified. Refresh.")
    return note_service.update_note(note_id, note_data, password)


@router.delete("/{alias}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(alias: str, note_id: int, password: str, db: Session = Depends(get_db)) -> None:
    user_service = UserService(db)
    note_service = NoteService(db)
    user = user_service.get_user_by_alias(alias)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{alias}' not found")
    if not user_service.verify_password(user, password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    note = note_service.get_note_by_id(note_id)
    if not note or note.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Note {note_id} not found")
    note_service.delete_note(note_id)
