import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Note,
  DecryptedNote,
  CreateNoteRequest,
  UpdateNoteRequest,
} from './types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post('/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/login', data);
    return response.data;
  },
};

export const notesApi = {
  getUserWithNotes: async (alias: string): Promise<{ user: User; notes: Note[] }> => {
    const response = await api.get(`/${alias}`);
    return {
      user: {
        id: response.data.id,
        alias: response.data.alias,
        encrypted_alias: response.data.encrypted_alias,
        created_at: response.data.created_at,
        last_accessed_at: response.data.last_accessed_at,
      },
      notes: response.data.notes,
    };
  },

  createNote: async (
    alias: string,
    password: string,
    data: CreateNoteRequest
  ): Promise<Note> => {
    const response = await api.post(`/${alias}/notes?password=${password}`, data);
    return response.data;
  },

  getNote: async (
    alias: string,
    noteId: number,
    password: string
  ): Promise<DecryptedNote> => {
    const response = await api.get(`/${alias}/notes/${noteId}?password=${password}`);
    return response.data;
  },

  updateNote: async (
    alias: string,
    noteId: number,
    password: string,
    data: UpdateNoteRequest
  ): Promise<Note> => {
    const response = await api.put(`/${alias}/notes/${noteId}?password=${password}`, data);
    return response.data;
  },

  deleteNote: async (alias: string, noteId: number, password: string): Promise<void> => {
    await api.delete(`/${alias}/notes/${noteId}?password=${password}`);
  },
};
