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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Crown,
  Loader2,
  Rocket,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const plans = {
  BASIC: {
    id: "BASIC",
    name: "Básico",
    price: 29,
    icon: Rocket,
    color: "blue",
    features: [
      "Hasta 3 conexiones propfirm-broker",
      "2 cuentas de trading",
      "Calculadora básica de lotaje",
      "Reportes mensuales",
      "Soporte por email",
    ],
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    price: 59,
    icon: Crown,
    color: "purple",
    features: [
      "Hasta 10 conexiones propfirm-broker",
      "10 cuentas de trading",
      "Calculadora avanzada",
      "Reportes en tiempo real",
      "Análisis de performance",
      "API access",
      "Soporte prioritario",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 99,
    icon: Star,
    color: "gold",
    features: [
      "Conexiones ilimitadas",
      "Cuentas ilimitadas",
      "Todas las herramientas",
      "Reportes personalizados",
      "Análisis institucional",
      "API completa",
      "Soporte 24/7",
      "Integraciones personalizadas",
    ],
  },
};

const paymentMethods = [
  { id: "STRIPE", name: "Tarjeta de Crédito", icon: "💳" },
  { id: "PAYPAL", name: "PayPal", icon: "🅿️" },
  { id: "MERCADOPAGO", name: "MercadoPago", icon: "🛒" },
  { id: "CULQI", name: "Culqi", icon: "🔒" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();
  const [selectedPlan, setSelectedPlan] = useState<string>("PREMIUM");
  const [paymentMethod, setPaymentMethod] = useState<string>("STRIPE");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: user?.email || "",
    acceptTerms: false,
  });

  const createSubscription = trpc.subscription.createSubscription.useMutation({
    onSuccess: () => {
      setIsProcessing(false);
      setIsSuccess(true);
      toast.success("¡Suscripción activada exitosamente!");
      // Redirect to main trader page after 3 seconds
      setTimeout(() => {
        router.push("/trader");
      }, 3000);
    },
    onError: (error) => {
      setIsProcessing(false);
      toast.error(`Error al procesar el pago: ${error.message}`);
    },
  });

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam && plans[planParam as keyof typeof plans]) {
      setSelectedPlan(planParam);
    }
  }, [searchParams]);

  // Update email when user data is available
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user?.email, formData.email]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create subscription with simulated payment
    createSubscription.mutate({
      plan: selectedPlan as "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE",
      paymentProvider: paymentMethod as
        | "STRIPE"
        | "PAYPAL"
        | "MERCADOPAGO"
        | "CULQI",
      providerCustomerId: `sim_${Date.now()}`,
      providerSubscriptionId: `sub_${Date.now()}`,
    });
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans];

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              ¡Pago Procesado Exitosamente!
            </h1>
            <p className="text-lg text-muted-foreground">
              Tu suscripción {currentPlan.name} ha sido activada. Ahora tienes
              acceso completo a todas las funcionalidades.
            </p>
          </div>

          <div className="bg-primary/10 rounded-lg p-6">
            <h2 className="font-semibold mb-2">Próximos pasos:</h2>
            <ul className="text-left space-y-2 text-sm">
              <li>• Configura tus primeras conexiones propfirm-broker</li>
              <li>• Agrega tus cuentas de trading</li>
              <li>• Explora la calculadora avanzada</li>
              <li>• Configura alertas personalizadas</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            Serás redirigido automáticamente en unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Compacto */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/trader/plans"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Planes
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">
            Finalizar Suscripción
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Completa tu información de pago para activar tu suscripción
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Summary */}
        <Card className="border-2 border-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div
                className={`p-2.5 rounded-xl ${
                  currentPlan.color === "blue"
                    ? "bg-blue-100"
                    : currentPlan.color === "purple"
                      ? "bg-purple-100"
                      : "bg-yellow-100"
                }`}
              >
                <currentPlan.icon
                  className={`h-5 w-5 ${
                    currentPlan.color === "blue"
                      ? "text-blue-600"
                      : currentPlan.color === "purple"
                        ? "text-purple-600"
                        : "text-yellow-600"
                  }`}
                />
              </div>
              Plan {currentPlan.name}
            </CardTitle>
            <CardDescription className="text-sm">
              Resumen de tu suscripción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex justify-between items-center bg-muted/30 rounded-lg p-4">
              <div>
                <span className="text-3xl font-bold text-foreground">
                  ${currentPlan.price}
                </span>
                <span className="text-muted-foreground ml-1">/mes</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  Facturación mensual
                </div>
                <div className="text-xs text-green-600 font-medium">
                  Sin compromiso
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Incluye:
              </h4>
              <ul className="space-y-2">
                {currentPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-border/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${currentPlan.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Impuestos:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50">
                <span>Total:</span>
                <span className="text-foreground">
                  ${currentPlan.price}/mes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="border-2 border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-muted/50 rounded-lg">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              Información de Pago
            </CardTitle>
            <CardDescription className="text-sm">
              Todos los pagos son procesados de forma segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Plan Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Plan de Suscripción
                </Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(plans).map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center gap-2">
                          <plan.icon className="h-4 w-4" />
                          {plan.name} - ${plan.price}/mes
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{method.icon}</span>
                          {method.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Provider Info */}
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border/50">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Serás redirigido a{" "}
                    {paymentMethod === "STRIPE"
                      ? "Stripe"
                      : paymentMethod === "PAYPAL"
                        ? "PayPal"
                        : paymentMethod === "MERCADOPAGO"
                          ? "MercadoPago"
                          : "Culqi"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completa el pago de forma segura en la plataforma externa
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Email de Facturación
                </Label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 p-4 bg-muted/10 rounded-lg border border-border/30">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange("acceptTerms", checked as boolean)
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  Acepto los{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline font-medium"
                  >
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline font-medium"
                  >
                    política de privacidad
                  </Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-[#131B2F] hover:bg-[#1a2542] text-white"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Redirigiendo...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceder al Pago - ${currentPlan.price}/mes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
