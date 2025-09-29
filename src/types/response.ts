// Tipos para respuesta extendida
import type { NextApiResponse } from "next";

export interface ApiResponse<T = Record<string, unknown>>
  extends NextApiResponse {
  json: (body: T) => void;
}
