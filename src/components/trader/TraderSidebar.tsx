"use client";

import { useAuthContext } from "@/AuthContext";
import { trpc } from "@/utils/trpc";
import {
  Cable,
  Calculator,
  CreditCard,
  Grid3X3,
  LogOut,
  Package,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
}

// Navigation items for users without subscription
const noSubscriptionNavItems: NavItem[] = [
  {
    title: "Planes",
    href: "/trader/plans",
    icon: Package,
    description: "Planes de suscripción disponibles",
  },
  {
    title: "Checkout",
    href: "/trader/checkout",
    icon: CreditCard,
    description: "Procesar pago de suscripción",
  },
  {
    title: "Perfil",
    href: "/trader/profile",
    icon: User,
    description: "Gestiona tu cuenta y configuración",
  },
];

// Navigation items for users with subscription
const subscriptionNavItems: NavItem[] = [
  {
    title: "Panel Principal",
    href: "/trader",
    icon: Grid3X3,
    description: "Vista general de tu actividad",
  },
  {
    title: "Conexiones",
    href: "/trader/connections",
    icon: Cable,
    description: "Gestiona tus conexiones propfirm-broker",
  },
  {
    title: "Cuentas de Trading",
    href: "/trader/accounts",
    icon: Wallet,
    description: "Administra todas tus cuentas",
  },
  {
    title: "Planes",
    href: "/trader/plans",
    icon: Package,
    description: "Planes de suscripción disponibles",
  },
  {
    title: "Checkout",
    href: "/trader/checkout",
    icon: CreditCard,
    description: "Procesar pago de suscripción",
  },
  {
    title: "Perfil",
    href: "/trader/profile",
    icon: User,
    description: "Gestiona tu cuenta y configuración",
  },
];

export function TraderSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthContext();

  // Get user subscription status
  const { data: userSubscription } =
    trpc.subscription.getCurrentUserSubscription.useQuery();

  // Debug: Log subscription data
  console.log("TraderSidebar: User subscription data:", userSubscription);

  // Temporarily force active subscription to show full sidebar
  const hasActiveSubscription = true;

  // Original verification (commented out for debugging)
  // const hasActiveSubscription =
  //   userSubscription?.status === "ACTIVE" &&
  //   userSubscription.currentPlanEnd &&
  //   new Date(userSubscription.currentPlanEnd) > new Date();

  console.log("TraderSidebar: Has active subscription? (forced to true)", {
    hasActiveSubscription,
    status: userSubscription?.status,
    currentPlanEnd: userSubscription?.currentPlanEnd,
    plan: userSubscription?.plan,
  });

  // Use appropriate navigation items based on subscription status
  const navItems = hasActiveSubscription
    ? subscriptionNavItems
    : noSubscriptionNavItems;

  return (
    <div className="w-64 bg-card border border-border shadow-md sticky top-0">
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/trader" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 text-card-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background
                ${isActive ? "bg-background border border-border" : ""}
              `}
            >
              <item.icon className="mr-3 h-5 w-5 transition-colors duration-200 text-muted-foreground group-hover:text-accent-foreground" />
              <div className="flex-1">
                <div className="font-medium text-card-foreground">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground font-normal">
                  {item.description}
                </div>
              </div>
              {item.badge && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={() => signOut()}
          className="w-full flex items-center px-4 py-2 text-sm text-destructive hover:text-destructive-foreground hover:bg-destructive/10 rounded-lg transition-colors duration-200"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
