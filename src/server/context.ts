import { auth } from "@/lib/auth";
import { initTRPC } from "@trpc/server";

export interface Context {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  rbac?: unknown;
}

export const createContext = async (opts: {
  req: Request;
}): Promise<Context> => {
  try {
    // Get session from Better Auth using cookies
    const session = await auth.api.getSession({
      headers: opts.req.headers,
    });

    if (!session?.user) {
      return {};
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
    };
  } catch (_error) {
    return {};
  }
};

export const t = initTRPC.context<Context>().create();
