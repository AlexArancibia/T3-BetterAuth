"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Crown, Headphones, Rocket, Star } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "BASIC",
    name: "Básico",
    price: 29,
    period: "mes",
    description: "Perfecto para traders que están comenzando su journey",
    icon: Rocket,
    color: "blue",
    features: [
      {
        name: "Hasta 3 conexiones propfirm-broker",
        included: true,
      },
      {
        name: "2 cuentas de trading",
        included: true,
      },
      {
        name: "Calculadora básica de lotaje",
        included: true,
      },
      {
        name: "Reportes mensuales",
        included: true,
      },
      {
        name: "Soporte por email",
        included: true,
      },
      {
        name: "Análisis de performance",
        included: false,
      },
      {
        name: "API access",
        included: false,
      },
      {
        name: "Soporte prioritario",
        included: false,
      },
    ],
    popular: false,
    cta: "Comenzar con Básico",
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 59,
    period: "mes",
    description: "Ideal para traders serios y profesionales",
    icon: Crown,
    color: "purple",
    features: [
      {
        name: "Hasta 10 conexiones propfirm-broker",
        included: true,
      },
      {
        name: "10 cuentas de trading",
        included: true,
      },
      {
        name: "Calculadora avanzada con múltiples métodos",
        included: true,
      },
      {
        name: "Reportes en tiempo real",
        included: true,
      },
      {
        name: "Análisis de performance detallado",
        included: true,
      },
      {
        name: "API access completo",
        included: true,
      },
      {
        name: "Soporte prioritario",
        included: true,
      },
      {
        name: "Alertas personalizadas",
        included: true,
      },
    ],
    popular: true,
    cta: "Elegir Premium",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 99,
    period: "mes",
    description: "Para traders institucionales y equipos grandes",
    icon: Star,
    color: "gold",
    features: [
      {
        name: "Conexiones ilimitadas",
        included: true,
      },
      {
        name: "Cuentas de trading ilimitadas",
        included: true,
      },
      {
        name: "Todas las herramientas avanzadas",
        included: true,
      },
      {
        name: "Reportes personalizados",
        included: true,
      },
      {
        name: "Análisis institucional",
        included: true,
      },
      {
        name: "API completa con webhooks",
        included: true,
      },
      {
        name: "Soporte 24/7",
        included: true,
      },
      {
        name: "Integraciones personalizadas",
        included: true,
      },
    ],
    popular: false,
    cta: "Contactar Ventas",
  },
];

export default function PlansPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Planes de Suscripción
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Elige el plan que mejor se adapte a tu nivel de trading y necesidades.
          Todos los planes incluyen acceso completo a nuestras herramientas
          profesionales.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.popular ? "border-primary shadow-xl scale-105" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Más Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div
                  className={`p-4 rounded-full ${
                    plan.color === "blue"
                      ? "bg-blue-100"
                      : plan.color === "purple"
                        ? "bg-purple-100"
                        : "bg-yellow-100"
                  }`}
                >
                  <plan.icon
                    className={`h-8 w-8 ${
                      plan.color === "blue"
                        ? "text-blue-600"
                        : plan.color === "purple"
                          ? "text-purple-600"
                          : "text-yellow-600"
                    }`}
                  />
                </div>
              </div>

              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-base">
                {plan.description}
              </CardDescription>

              <div className="pt-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 mt-0.5 ${
                        feature.included
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {feature.included ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link
                  href={`/trader/checkout?plan=${plan.id}`}
                  className="block"
                >
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-secondary hover:bg-secondary/90"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Preguntas Frecuentes
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              ¿Puedo cambiar de plan en cualquier momento?
            </AccordionTrigger>
            <AccordionContent>
              Sí, puedes actualizar o degradar tu plan en cualquier momento. Los
              cambios se aplicarán en el próximo ciclo de facturación.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>¿Hay período de prueba?</AccordionTrigger>
            <AccordionContent>
              Ofrecemos 7 días de prueba gratuita para todos los planes. No se
              requiere tarjeta de crédito para comenzar.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>¿Qué métodos de pago aceptan?</AccordionTrigger>
            <AccordionContent>
              Aceptamos tarjetas de crédito, PayPal, MercadoPago y otros métodos
              de pago populares en tu región.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>
              ¿Puedo cancelar en cualquier momento?
            </AccordionTrigger>
            <AccordionContent>
              Sí, puedes cancelar tu suscripción en cualquier momento desde tu
              panel de control. No hay penalizaciones por cancelación.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>
              ¿Qué incluye el soporte técnico?
            </AccordionTrigger>
            <AccordionContent>
              Nuestro soporte técnico incluye ayuda con la configuración de
              conexiones, resolución de problemas técnicos, y asistencia con el
              uso de las herramientas de la plataforma. El tiempo de respuesta
              varía según tu plan.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>¿Mis datos están seguros?</AccordionTrigger>
            <AccordionContent>
              Sí, utilizamos encriptación de extremo a extremo para proteger tus
              datos. Cumplimos con las regulaciones de seguridad más estrictas y
              nunca compartimos tu información con terceros sin tu
              consentimiento.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">
            ¿Tienes Preguntas?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nuestro equipo de soporte está aquí para ayudarte a elegir el plan
            perfecto para tus necesidades de trading.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/trader/checkout">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Comenzar Prueba Gratuita
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              <Headphones className="h-4 w-4 mr-2" />
              Contactar Soporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
