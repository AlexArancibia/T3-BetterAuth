"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../server/routers/_app";

// Solo exportamos la instancia de trpc para uso en componentes
// El provider se maneja en @/hooks/useTRPC
export const trpc = createTRPCReact<AppRouter>();
