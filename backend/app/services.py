from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models import User, Note, SharedNote
from app.schemas import UserCreate, NoteCreate, NoteUpdate
from app.crypto import CryptoUtils
from datetime import datetime, timedelta
from typing import Optional, List
import secrets


class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_alias(self, alias: str) -> Optional[User]:
        stmt = select(User).where(User.alias == alias.lower(), User.is_active == True)
        return self.db.scalars(stmt).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        stmt = select(User).where(User.id == user_id, User.is_active == True)
        return self.db.scalars(stmt).first()
    
    def create_user(self, user_data: UserCreate) -> User:
        encrypted_alias = CryptoUtils.encrypt(user_data.alias.lower(), user_data.password)
        user = User(
            alias=user_data.alias.lower(),
            encrypted_alias=encrypted_alias,
            created_at=datetime.utcnow(),
            last_accessed_at=datetime.utcnow()
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def verify_password(self, user: User, password: str) -> bool:
        try:
            decrypted = CryptoUtils.decrypt(user.encrypted_alias, password)
            return decrypted == user.alias
        except:
            return False
    
    def update_last_accessed(self, user_id: int) -> None:
        user = self.get_user_by_id(user_id)
        if user:
            user.last_accessed_at = datetime.utcnow()
            self.db.commit()


class NoteService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_note_by_id(self, note_id: int) -> Optional[Note]:
        stmt = select(Note).where(Note.id == note_id, Note.is_active == True)
        return self.db.scalars(stmt).first()
    
    def get_user_notes(self, user_id: int) -> List[Note]:
        stmt = select(Note).where(Note.user_id == user_id, Note.is_active == True).order_by(Note.created_at.desc())
        return list(self.db.scalars(stmt).all())
    
    def create_note(self, user_id: int, note_data: NoteCreate, password: str) -> Note:
        encrypted_title = CryptoUtils.encrypt(note_data.title, password) if note_data.title else None
        encrypted_content = CryptoUtils.encrypt(note_data.content, password)
        content_hash = CryptoUtils.hash_content(encrypted_content)
        note = Note(
            user_id=user_id,
            encrypted_title=encrypted_title,
            encrypted_content=encrypted_content,
            content_hash=content_hash,
            created_at=datetime.utcnow()
        )
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return note
    
    def update_note(self, note_id: int, note_data: NoteUpdate, password: str) -> Note:
        note = self.get_note_by_id(note_id)
        if note_data.title is not None:
            note.encrypted_title = CryptoUtils.encrypt(note_data.title, password)
        encrypted_content = CryptoUtils.encrypt(note_data.content, password)
        content_hash = CryptoUtils.hash_content(encrypted_content)
        note.encrypted_content = encrypted_content
        note.content_hash = content_hash
        note.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(note)
        return note
    
    def delete_note(self, note_id: int) -> None:
        note = self.get_note_by_id(note_id)
        if note:
            note.is_active = False
            note.updated_at = datetime.utcnow()
            self.db.commit()
    
    def decrypt_note_content(self, note: Note, password: str) -> Optional[str]:
        try:
            return CryptoUtils.decrypt(note.encrypted_content, password)
        except:
            return None
    
    def decrypt_note_title(self, note: Note, password: str) -> Optional[str]:
        try:
            return CryptoUtils.decrypt(note.encrypted_title, password) if note.encrypted_title else None
        except:
            return None


class SharedNoteService:
    """Service for managing shared notes"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_shared_note_by_token(self, token: str) -> Optional[SharedNote]:
        """Get a shared note by its token"""
        stmt = select(SharedNote).where(
            SharedNote.share_token == token,
            SharedNote.is_active == True
        )
        shared = self.db.scalars(stmt).first()
        
        # Check expiration
        if shared and shared.expires_at and shared.expires_at < datetime.utcnow():
            shared.is_active = False
            self.db.commit()
            return None
        
        return shared
    
    def get_shared_note_by_note_id(self, note_id: int) -> Optional[SharedNote]:
        """Get a shared note by its original note ID"""
        stmt = select(SharedNote).where(
            SharedNote.note_id == note_id,
            SharedNote.is_active == True
        )
        return self.db.scalars(stmt).first()
    
    def create_shared_note(
        self, 
        note: Note, 
        password: str, 
        expires_in_hours: Optional[int] = None
    ) -> SharedNote:
        """Create a shared version of a note"""
        # Check if already shared
        existing = self.get_shared_note_by_note_id(note.id)
        if existing:
            return existing
        
        # Generate unique token
        share_token = secrets.token_urlsafe(32)
        
        # Re-encrypt with a share-specific key derived from the token
        note_service = NoteService(self.db)
        decrypted_title = note_service.decrypt_note_title(note, password)
        decrypted_content = note_service.decrypt_note_content(note, password)
        
        # Encrypt with share token as the key
        encrypted_title = CryptoUtils.encrypt(decrypted_title, share_token) if decrypted_title else None
        encrypted_content = CryptoUtils.encrypt(decrypted_content, share_token)
        
        # Calculate expiration
        expires_at = None
        if expires_in_hours:
            expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
        
        shared_note = SharedNote(
            note_id=note.id,
            share_token=share_token,
            encrypted_title=encrypted_title,
            encrypted_content=encrypted_content,
            created_at=datetime.utcnow(),
            expires_at=expires_at,
            view_count=0,
            is_active=True
        )
        
        self.db.add(shared_note)
        self.db.commit()
        self.db.refresh(shared_note)
        
        return shared_note
    
    def view_shared_note(self, shared_note: SharedNote) -> dict:
        """Get decrypted content and increment view count"""
        # Decrypt using the share token
        title = None
        if shared_note.encrypted_title:
            try:
                title = CryptoUtils.decrypt(shared_note.encrypted_title, shared_note.share_token)
            except:
                pass
        
        try:
            content = CryptoUtils.decrypt(shared_note.encrypted_content, shared_note.share_token)
        except:
            content = ""
        
        # Increment view count
        shared_note.view_count += 1
        self.db.commit()
        
        return {
            "title": title,
            "content": content,
            "created_at": shared_note.created_at,
            "view_count": shared_note.view_count
        }
    
    def delete_shared_note(self, note_id: int) -> bool:
        """Remove sharing for a note"""
        shared = self.get_shared_note_by_note_id(note_id)
        if shared:
            shared.is_active = False
            self.db.commit()
            return True
        return False
