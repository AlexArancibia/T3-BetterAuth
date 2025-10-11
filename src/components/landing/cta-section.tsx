import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="w-full bg-background py-24 md:py-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center">
          {/* Subtle accent line */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8" />

          {/* Main heading */}
          <h2 className="text-foreground text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6 tracking-tight">
            ¿Listo para transformar
            <br />
            <span className="font-medium text-primary">tu trading?</span>
          </h2>

          {/* Subtitle */}
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12 font-light">
            Únete a traders profesionales que ya están escalando sus operaciones
            con FENIZ
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-base font-medium rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 min-w-[200px]"
              >
                Comenzar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            {/* Secondary CTA */}
            <Link href="#pricing-section">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-base font-medium rounded-full border-border/50 hover:border-primary/50 hover:text-primary transition-all duration-200 min-w-[200px]"
              >
                Ver planes
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-border/30">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Sin compromiso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Configuración en minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
