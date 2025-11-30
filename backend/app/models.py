from sqlalchemy import String, Text, Integer, Boolean, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, List
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    alias: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    encrypted_alias: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    last_accessed_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[List["Note"]] = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    folders: Mapped[List["Folder"]] = relationship("Folder", back_populates="user", cascade="all, delete-orphan")
    
    __table_args__ = (Index('idx_user_alias_active', 'alias', 'is_active'),)


class Folder(Base):
    __tablename__ = "folders"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    encrypted_name: Mapped[str] = mapped_column(Text, nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, default='default')
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default='folder')
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="folders")
    notes: Mapped[List["Note"]] = relationship("Note", back_populates="folder")
    
    __table_args__ = (Index('idx_folder_user_active', 'user_id', 'is_active'),)


class Note(Base):
    __tablename__ = "notes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    folder_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('folders.id', ondelete='SET NULL'), nullable=True, index=True)
    encrypted_title: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    encrypted_content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(nullable=True, onupdate=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="notes")
    folder: Mapped[Optional["Folder"]] = relationship("Folder", back_populates="notes")
    
    __table_args__ = (
        Index('idx_note_user_active', 'user_id', 'is_active'),
        Index('idx_note_folder', 'folder_id'),
        Index('idx_note_created', 'created_at'),
    )
