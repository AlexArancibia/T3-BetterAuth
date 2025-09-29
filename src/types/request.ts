// Tipos para request extendido con usuario autenticado
import type { NextApiRequest } from "next";
import type { User } from "./user";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}
