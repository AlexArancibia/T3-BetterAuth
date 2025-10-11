import Image from "next/image";

interface BentoCardProps {
  title: string;
  description: string;
  image: string;
}

const BentoCard = ({ title, description, image }: BentoCardProps) => (
  <div className="group overflow-hidden rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 flex flex-col justify-between h-full">
    <div className="p-5 flex flex-col gap-3">
      <h3 className="text-foreground text-lg font-semibold leading-snug">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
    <div className="relative h-56 overflow-hidden">
      <Image
        src={image}
        alt={title}
        width={400}
        height={224}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  </div>
);

export function BentoSection() {
  const cards = [
    {
      title: "Revisiones de trades con IA",
      description:
        "Obtén sugerencias inteligentes en tiempo real para mejores operaciones.",
      image: "/images/ai-code-reviews.png",
    },
    {
      title: "Vistas previas en tiempo real",
      description: "Chatea, colabora y previsualiza cambios al instante.",
      image: "/images/realtime-coding-previews.png",
    },
    {
      title: "Integraciones con un click",
      description:
        "Conecta fácilmente con tus herramientas favoritas de trading.",
      image: "/images/one-click-integrations.png",
    },
    {
      title: "Conectividad MCP flexible",
      description:
        "Gestiona y configura el acceso a servidores MCP sin esfuerzo.",
      image: "/images/mcp-connectivity.png",
    },
    {
      title: "Agentes de trading paralelos",
      description:
        "Resuelve problemas complejos más rápido con múltiples agentes IA.",
      image: "/images/parallel-coding-agents.png",
    },
    {
      title: "Despliegue simplificado",
      description: "Pasa de operar a producción al instante.",
      image: "/images/deployment-easy.png",
    },
  ];

  return (
    <section className="w-full px-5 py-12 md:py-16 bg-gray-50/50 dark:bg-background flex flex-col justify-center items-center">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-12">
          {/* Subtle accent line */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8" />

          <h2 className="text-foreground text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6 tracking-tight">
            Potencia tu Operativa
            <br />
            <span className="font-medium text-primary">de Trading</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
            Plataforma profesional con sincronización en tiempo real,
            integraciones perfectas y análisis potentes para optimizar tus
            operaciones.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
