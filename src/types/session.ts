// Tipos para sesión de usuario
export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  token: string;
}
