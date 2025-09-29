"use client";

import { useAuthContext } from "@/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  BarChart3,
  Cable,
  Calculator,
  CheckCircle,
  Clock,
  Crown,
  Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const { loading } = useAuthContext();

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Permitir que usuarios autenticados vean la landing page
  // La redirección se maneja en RoleBasedRedirect para otras rutas

  const pricingPlans = [
    {
      name: "Starter",
      price: "$99",
      period: "/mes",
      description: "Perfecto para traders individuales",
      icon: <Zap className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      features: [
        "Hasta 3 cuentas de trading",
        "2 Propfirms conectadas",
        "Copy trading básico",
        "Dashboard estándar",
        "Soporte por email",
        "Latencia < 100ms",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$299",
      period: "/mes",
      description: "Para traders serios y equipos pequeños",
      icon: <Crown className="h-6 w-6" />,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      features: [
        "Hasta 10 cuentas de trading",
        "5 Propfirms conectadas",
        "Copy trading avanzado",
        "Analytics profesionales",
        "Soporte prioritario",
        "Latencia < 50ms",
        "Sistema RBAC básico",
        "Calculadora profesional",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$799",
      period: "/mes",
      description: "Para operaciones a gran escala",
      icon: <Sparkles className="h-6 w-6" />,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      features: [
        "Cuentas ilimitadas",
        "Propfirms ilimitadas",
        "Copy trading empresarial",
        "Analytics avanzados",
        "Soporte 24/7",
        "Latencia < 25ms",
        "RBAC completo",
        "API personalizada",
        "White-label disponible",
        "SLA garantizado",
      ],
      popular: false,
    },
  ];

  const keyFeatures = [
    {
      icon: <Cable className="h-8 w-8" />,
      title: "Copy Trading Automático",
      description:
        "Conecta múltiples propfirms con brokers para trading instantáneo con latencia ultra-baja",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics Profesionales",
      description:
        "Dashboard con métricas en tiempo real, análisis de trades y reportes detallados",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Sistema RBAC Seguro",
      description:
        "Control de acceso basado en roles con permisos granulares para equipos",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Calculadora Avanzada",
      description:
        "Herramientas profesionales para gestión de riesgo y cálculo de lotaje",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Trader Profesional, FTMO",
      content:
        "Esta plataforma me ha permitido escalar mi trading de manera exponencial. La sincronización es perfecta y nunca he perdido una operación.",
      rating: 5,
    },
    {
      name: "Marcus Williams",
      role: "Fund Manager, TopStep",
      content:
        "La calculadora de posición integrada me ha ahorrado horas de cálculos manuales. El ROI es increíble.",
      rating: 5,
    },
    {
      name: "Sofia Rodriguez",
      role: "Trading Coach, MyForexFunds",
      content:
        "Recomiendo esta herramienta a todos mis estudiantes. Las métricas de análisis son de nivel institucional.",
      rating: 5,
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    console.log("Formulario enviado:", contactForm);
    alert("Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.");
    setContactForm({ name: "", email: "", company: "", message: "" });
  };

  // Landing page para usuarios no autenticados
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10 py-20 overflow-hidden border-b border-border">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/25 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Plataforma profesional de copy trading
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Plataforma de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/80">
                {" "}
                Copy Trading{" "}
              </span>
              para Profesionales
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Conecta propfirms con brokers para trading automático con latencia
              ultra-baja. Sistema completo con analytics, RBAC y herramientas
              profesionales.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Comenzar Prueba Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#pricing"
                className="border-2 border-border text-foreground px-10 py-4 rounded-xl font-semibold hover:bg-accent hover:text-accent-foreground transition-all duration-300 flex items-center justify-center"
              >
                <Eye className="mr-2 h-5 w-5" />
                Ver Precios
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-primary" />
                Sistema RBAC Seguro
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                Latencia {"<"} 50ms
              </div>
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-primary" />
                Multi-PropFirm Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-muted/30" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Funcionalidades
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                {" "}
                Principales{" "}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Todo lo que necesitas para operar como un profesional del trading.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300 group hover:border-primary/50 text-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className={feature.color}>{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-background" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Planes de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                {" "}
                Suscripción{" "}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a tu operación de trading
              profesional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-card p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 ${plan.bgColor} rounded-xl mb-4`}
                  >
                    <div className={plan.color}>{plan.icon}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "border-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  Comenzar Prueba
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Todos los planes incluyen 14 días de prueba gratuita
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-primary" />
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                Cancelar en cualquier momento
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary" />
                Soporte técnico incluido
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
              <div className="text-4xl font-bold text-primary mb-2">
                {"<"}50ms
              </div>
              <div className="text-foreground font-medium mb-2">
                Latencia Ultra-Baja
              </div>
              <div className="text-sm text-muted-foreground">
                Ejecución instantánea de trades
              </div>
            </div>
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-foreground font-medium mb-2">
                Monitoreo Continuo
              </div>
              <div className="text-sm text-muted-foreground">
                Sistema siempre disponible
              </div>
            </div>
            <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-foreground font-medium mb-2">
                PropFirms Soportadas
              </div>
              <div className="text-sm text-muted-foreground">
                Integración completa
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Casos de Éxito de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                {" "}
                Traders Profesionales{" "}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Historias reales de traders que han escalado su operación
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover:border-primary/50"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={`star-${testimonial.name}-${i}`}
                      className="h-4 w-4 text-primary fill-current"
                    />
                  ))}
                </div>
                <blockquote className="text-foreground mb-4 text-sm italic leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm mr-3">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                ¿Listo para
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                  {" "}
                  Comenzar{" "}
                </span>
                tu Operación Profesional?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Únete a traders profesionales que ya están escalando su
                operación con nuestra plataforma integral de copy trading
                automático.
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Soporte Técnico 24/7
                    </div>
                    <div className="text-muted-foreground text-sm">
                      +1 (555) 123-4567
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Email de Contacto
                    </div>
                    <div className="text-muted-foreground text-sm">
                      support@tradingplatform.com
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Oficina Principal
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Miami, FL - USA
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border shadow-lg">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Contacta con Nuestro Equipo
              </h3>

              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-foreground font-medium"
                    >
                      Nombre Completo *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Tu nombre"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="text-foreground font-medium"
                    >
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="tu@email.com"
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="company"
                    className="text-foreground font-medium"
                  >
                    Empresa/Propfirm
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    value={contactForm.company}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    placeholder="Nombre de tu empresa (opcional)"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="message"
                    className="text-foreground font-medium"
                  >
                    Mensaje *
                  </Label>
                  <textarea
                    id="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Cuéntanos sobre tu estrategia de trading y cómo podemos ayudarte..."
                    required
                    className="mt-2 w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Enviar Mensaje
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card border-t border-border relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Plataforma profesional lista para usar
            </span>
          </div>

          <h2 className="text-3xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Comienza tu Operación
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/80">
              Profesional Hoy Mismo
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Sin riesgo. Sin compromisos. 14 días de prueba gratuita para que
            experimentes todas las funcionalidades del sistema profesional de
            copy trading.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground px-12 py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <TrendingUp className="mr-3 h-6 w-6" />
              Comenzar Prueba Gratuita
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>

            <div className="flex items-center space-x-6 text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-primary mr-2" />
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-primary mr-2" />
                100% Seguro
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/signin"
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
