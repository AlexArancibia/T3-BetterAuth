import { router } from "../trpc";
import { accountLinkRouter } from "./accountLink";
import { brokerRouter } from "./broker";
import { companyInfoRouter } from "./companyInfo";
import { propfirmRouter } from "./propfirm";
import { propfirmAccountTypeRouter } from "./propfirmAccountType";
import { propfirmPhaseRouter } from "./propfirmPhase";
import { propfirmRulesConfigRouter } from "./propfirmRulesConfig";
import { rbacRouter } from "./rbac";
import { subscriptionRouter } from "./subscription";
import { symbolRouter } from "./symbol";
import { symbolConfigRouter } from "./symbolConfig";
import { tradeRouter } from "./trade";
import { tradingAccountRouter } from "./tradingAccount";
import { userRouter } from "./user";

export const appRouter = router({
  user: userRouter,
  rbac: rbacRouter,
  subscription: subscriptionRouter,
  companyInfo: companyInfoRouter,
  propfirm: propfirmRouter,
  propfirmPhase: propfirmPhaseRouter,
  propfirmAccountType: propfirmAccountTypeRouter,
  propfirmRulesConfig: propfirmRulesConfigRouter,
  broker: brokerRouter,
  symbol: symbolRouter,
  symbolConfig: symbolConfigRouter,
  accountLink: accountLinkRouter,
  tradingAccount: tradingAccountRouter,
  trade: tradeRouter,
});

export type AppRouter = typeof appRouter;
