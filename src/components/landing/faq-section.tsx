"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "¿Qué es el copy trading?",
      answer:
        "El copy trading permite replicar automáticamente operaciones de una cuenta a múltiples cuentas en tiempo real con latencia ultra-baja.",
    },
    {
      question: "¿Qué propfirms son compatibles?",
      answer:
        "Soportamos más de 50 propfirms incluyendo FTMO, TopStep, MyForexFunds, y muchas más. Agregamos integraciones regularmente.",
    },
    {
      question: "¿Cuál es la latencia de ejecución?",
      answer:
        "Nuestra plataforma ofrece ejecución con latencia ultra-baja menor a 50ms en planes Profesional y menor a 25ms en planes Empresarial.",
    },
    {
      question: "¿Puedo gestionar permisos de equipo?",
      answer:
        "Sí, nuestro sistema RBAC (Control de Acceso Basado en Roles) permite configurar permisos granulares para miembros del equipo.",
    },
    {
      question: "¿Hay prueba gratuita?",
      answer:
        "Sí, todos los planes incluyen 14 días de prueba gratuita sin tarjeta de crédito. Puedes cancelar cuando quieras.",
    },
    {
      question: "¿Qué opciones de soporte están disponibles?",
      answer:
        "Ofrecemos soporte por email en Inicial, soporte prioritario en Profesional, y soporte dedicado 24/7 en planes Empresarial.",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 bg-white dark:bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          {/* Subtle accent line */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6 md:mb-8" />

          <h2 className="text-gray-900 dark:text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4 md:mb-6 tracking-tight">
            Preguntas
            <br />
            <span className="font-medium text-primary">Frecuentes</span>
          </h2>
          <p className="text-gray-600 dark:text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
            Todo lo que necesitas saber sobre nuestra plataforma
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.question}
              value={faq.question}
              className="bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl px-4 sm:px-6 py-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <AccordionTrigger className="text-gray-900 dark:text-foreground hover:text-primary transition-colors text-left font-medium py-3 sm:py-4 hover:no-underline text-sm sm:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-muted-foreground pb-3 sm:pb-4 leading-relaxed text-sm sm:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
