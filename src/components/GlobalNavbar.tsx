"use client";

import { useAuthContext } from "@/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Cable,
  Calculator,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
}

const traderNavItems: NavItem[] = [
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
];

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuthContext();
  const { primaryRole } = useUserRole();
  const router = useRouter();

  // Verificar si estamos en la sección del trader
  const isTraderSection = pathname?.startsWith("/trader");

  // No mostrar navbar solo en páginas de registro y recuperación de contraseña
  if (
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password")
  ) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      router.push("/");
    } catch (_error) {
      // Error handled by Better Auth
    }
  };

  const handleSignIn = () => {
    router.push("/signin");
    setIsMenuOpen(false);
  };

  const getDashboardUrl = () => {
    switch (primaryRole) {
      case "trader":
        return "/trader";
      case "admin":
      case "super_admin":
      case "viewer":
        return "/dashboard";
      default:
        return "/trader"; // Default to trader for unknown roles
    }
  };

  return (
    <>
      <nav className="px-4 sm:px-6 lg:px-8 border-b bg-[#131B2F] border-gray-700 shadow-lg z-50">
        <div className="max-w-[1500px] mx-auto ">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-[#F5BA35] to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="ml-2 text-xl font-medium text-white">
                  Feniz
                </span>
              </Link>
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden lg:block">
              <div className="ml-4 flex items-center md:ml-6">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    {/* User Name */}
                    <span className="text-white font-medium text-sm">
                      {user?.name || "Usuario"}
                    </span>

                    {/* User Avatar Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Avatar className="cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all">
                          {user?.image ? (
                            <AvatarImage
                              src={user.image}
                              alt={user?.name || "Usuario"}
                            />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user?.name
                                ? user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56 border border-border"
                        align="end"
                        forceMount
                      >
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user?.name || "Usuario"}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user?.email || ""}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => router.push(getDashboardUrl())}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="text-red-600 focus:text-red-600"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Cerrar sesión</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleSignIn}
                      className="text-muted-foreground hover:text-card-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                    <Link
                      href="/signup"
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-300 hover:text-white p-2 rounded-md transition-colors"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-96 bg-[#20252F] border-gray-700"
                >
                  <SheetHeader className="px-2">
                    <SheetTitle className="text-white text-lg">
                      {isTraderSection ? "Centro de Trading" : "Menú"}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 px-2">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 px-3 py-2">
                          <Avatar>
                            {user?.image ? (
                              <AvatarImage
                                src={user.image}
                                alt={user?.name || "Usuario"}
                              />
                            ) : (
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {user?.name
                                  ? user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : "U"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                              {user?.name || "Usuario"}
                            </span>
                            <span className="text-xs text-gray-300">
                              {user?.email || ""}
                            </span>
                          </div>
                        </div>

                        {/* Trader Navigation Items */}
                        {isTraderSection && (
                          <div className="space-y-3">
                            {traderNavItems.map((item) => {
                              const isActive =
                                pathname === item.href ||
                                (item.href !== "/trader" &&
                                  pathname.startsWith(item.href));

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  className={`
                                    group flex items-center px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200
                                    ${
                                      isActive
                                        ? "bg-primary text-primary-foreground shadow-lg"
                                        : "text-gray-300 hover:text-white hover:bg-accent"
                                    }
                                  `}
                                >
                                  <item.icon
                                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                                      isActive
                                        ? "text-primary-foreground"
                                        : "text-gray-400 group-hover:text-white"
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <div
                                      className={`font-medium ${
                                        isActive
                                          ? "text-primary-foreground"
                                          : "text-white"
                                      }`}
                                    >
                                      {item.title}
                                    </div>
                                    <div
                                      className={`text-xs ${
                                        isActive
                                          ? "text-primary-foreground/80"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {item.description}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        {/* Dashboard Link (if not in trader section) */}
                        {!isTraderSection && (
                          <button
                            type="button"
                            onClick={() => {
                              router.push(getDashboardUrl());
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-300 hover:text-white transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Dashboard</span>
                          </button>
                        )}

                        {/* Theme Toggle */}

                        {/* Trader Footer Actions */}
                        {isTraderSection && (
                          <div className="space-y-3 pt-6 border-t border-gray-600">
                            <Link
                              href="/trader/settings"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-accent rounded-lg transition-colors duration-200"
                            >
                              <Settings className="mr-3 h-4 w-4" />
                              Configuración
                            </Link>
                            <Link
                              href="/trader/profile"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-accent rounded-lg transition-colors duration-200"
                            >
                              <User className="mr-3 h-4 w-4" />
                              Perfil
                            </Link>
                          </div>
                        )}

                        {/* Sign Out */}
                        <button
                          type="button"
                          onClick={() => {
                            handleSignOut();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-5 py-3 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-accent transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <button
                          type="button"
                          onClick={handleSignIn}
                          className="w-full text-left text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        >
                          Iniciar Sesión
                        </button>
                        <Link
                          href="/signup"
                          className="w-full text-left text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Registrarse
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
