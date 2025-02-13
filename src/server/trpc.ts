import { authOptions } from "@/lib/auth";
import { initTRPC } from "@trpc/server";
import { getServerSession } from "next-auth";

const t = initTRPC.create();
const middleware = t.middleware;

// auth procedure
const isAuth = middleware(async (opts) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user) {
    throw new Error("Unauthorized");
  }
  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  });
});
export const privateProcedure = t.procedure.use(isAuth);
export const router = t.router;
export const publicProcedure = t.procedure;
