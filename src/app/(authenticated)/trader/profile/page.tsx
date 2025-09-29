"use client";

import { useAuthContext } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Eye,
  EyeOff,
  Key,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

interface ExtendedUser {
  id?: string;
  name?: string;
  email?: string;
  createdAt?: Date;
  provider?: string;
}

export default function ProfilePage() {
  const { user } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const extendedUser = user as ExtendedUser;
  const [isGoogleUser] = useState(extendedUser?.provider === "google");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground mt-0.5 mr-8">
          Gestiona tu cuenta, plan y configuración personal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Información Personal
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Actualiza tu información personal y de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-foreground"
                  >
                    Nombre
                  </Label>
                  <Input
                    id="firstName"
                    defaultValue={user?.name?.split(" ")[0] || ""}
                    placeholder="Tu nombre"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-foreground"
                  >
                    Apellido
                  </Label>
                  <Input
                    id="lastName"
                    defaultValue={
                      user?.name?.split(" ").slice(1).join(" ") || ""
                    }
                    placeholder="Tu apellido"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="bg-muted text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  El correo no se puede cambiar
                </p>
              </div>
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
                onClick={() =>
                  alert("Funcionalidad de guardar cambios no implementada aún")
                }
              >
                <Settings className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>

          {/* Cambio de Contraseña - Solo si no es usuario de Google */}
          {!isGoogleUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Key className="h-5 w-5 text-primary" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="currentPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Contraseña Actual
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña actual"
                      className="text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Nueva Contraseña
                  </Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirmar Nueva Contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirma tu nueva contraseña"
                    className="text-sm"
                  />
                </div>
                <Button
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white border-0"
                  onClick={() =>
                    alert(
                      "Funcionalidad de cambio de contraseña no implementada aún"
                    )
                  }
                >
                  <Key className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mensaje para usuarios de Google */}
          {isGoogleUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Shield className="h-5 w-5 text-primary" />
                  Autenticación con Google
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Tu cuenta está vinculada con Google
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Al registrarte con Google, tu contraseña se gestiona a través
                  de tu cuenta de Google. Para cambiar tu contraseña, visita tu{" "}
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                  >
                    configuración de seguridad de Google
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Plan Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <CreditCard className="h-5 w-5 text-primary" />
                Plan Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-semibold text-primary mb-2">
                  Gratuito
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Plan básico con funcionalidades limitadas
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    alert(
                      "Funcionalidad de actualización de plan no implementada aún"
                    )
                  }
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Actualizar Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información de Cuenta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Información de Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID de Usuario:</span>
                <span className="font-mono text-xs text-foreground">
                  {user?.id?.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Proveedor:</span>
                <span className="capitalize text-foreground">
                  {extendedUser?.provider || "Email"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Miembro desde:</span>
                <span className="text-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
