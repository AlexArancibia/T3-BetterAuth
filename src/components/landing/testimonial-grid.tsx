import Image from "next/image";

interface TestimonialCardProps {
  quote: string;
  name: string;
  company: string;
  avatar: string;
  type: string;
}

const testimonials: TestimonialCardProps[] = [
  {
    quote:
      "Las sugerencias en tiempo real de FENIZ son como tener un trader senior revisando cada operación mientras operas. La precisión de sus recomendaciones mejoró nuestra calidad general, redujo el tiempo de revisión.",
    name: "Ana García",
    company: "PropFirm Elite",
    avatar: "/images/avatars/annette-black.png",
    type: "large-teal",
  },
  {
    quote:
      "Integrar FENIZ en nuestro stack fue sencillo, y las conexiones con propfirms nos ahorraron días de configuración",
    name: "Diego Ruiz",
    company: "Trading Masters",
    avatar: "/images/avatars/dianne-russell.png",
    type: "small-dark",
  },
  {
    quote:
      "Configurar FENIZ fue simple, se sintió perfecto. Pasamos de operar a ver nuestros cambios en vivo en minutos sin preocuparnos por latencia o problemas de configuración.",
    name: "Alberto Flores",
    company: "Elite Traders",
    avatar: "/images/avatars/albert-flores.png",
    type: "large-light",
  },
  {
    quote:
      "La función de copy trading de FENIZ cambió las reglas del juego. Estamos escalando cuentas en horas en lugar de gastar semanas enteras.",
    name: "Camila Torres",
    company: "Forex Pro",
    avatar: "/images/avatars/cameron-williamson.png",
    type: "small-dark",
  },
];

const TestimonialCard = ({
  quote,
  name,
  company,
  avatar,
  type,
}: TestimonialCardProps) => {
  const isLargeCard = type.startsWith("large");
  const avatarSize = isLargeCard ? 48 : 36;
  const avatarBorderRadius = isLargeCard
    ? "rounded-[41px]"
    : "rounded-[30.75px]";
  const padding = isLargeCard ? "p-6" : "p-5";

  let cardClasses = `flex flex-col justify-between items-start overflow-hidden rounded-xl shadow-md relative ${padding}`;
  let quoteClasses = "";
  let nameClasses = "";
  let companyClasses = "";
  let backgroundElements = null;
  let cardHeight = "";
  const cardWidth = "w-full";

  if (type === "large-teal") {
    cardClasses += " bg-primary";
    quoteClasses +=
      " text-primary-foreground text-xl md:text-2xl font-semibold leading-relaxed";
    nameClasses += " text-primary-foreground text-base font-medium leading-6";
    companyClasses +=
      " text-primary-foreground/70 text-sm font-normal leading-6";
    cardHeight = "h-full min-h-[480px]";
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: "url('/images/large-card-background.svg')",
          zIndex: 0,
        }}
      />
    );
  } else if (type === "large-light") {
    cardClasses +=
      " bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900";
    quoteClasses +=
      " text-foreground text-xl md:text-2xl font-semibold leading-relaxed";
    nameClasses += " text-foreground text-base font-medium leading-6";
    companyClasses += " text-muted-foreground text-sm font-normal leading-6";
    cardHeight = "h-full min-h-[480px]";
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: "url('/images/large-card-background.svg')",
          zIndex: 0,
        }}
      />
    );
  } else {
    cardClasses += " bg-card border border-border/50";
    quoteClasses += " text-foreground/90 text-base font-normal leading-relaxed";
    nameClasses += " text-foreground text-sm font-medium leading-[22px]";
    companyClasses +=
      " text-muted-foreground text-xs font-normal leading-[22px]";
    cardHeight = "h-full";
  }

  return (
    <div className={`${cardClasses} ${cardWidth} ${cardHeight}`}>
      {backgroundElements}
      <div className={`relative z-10 font-normal break-words ${quoteClasses}`}>
        {quote}
      </div>
      <div className="relative z-10 flex justify-start items-center gap-3">
        <Image
          src={avatar || "/placeholder.svg"}
          alt={`${name} avatar`}
          width={avatarSize}
          height={avatarSize}
          className={`w-${avatarSize / 4} h-${avatarSize / 4} ${avatarBorderRadius}`}
          style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
        />
        <div className="flex flex-col justify-start items-start gap-0.5">
          <div className={nameClasses}>{name}</div>
          <div className={companyClasses}>{company}</div>
        </div>
      </div>
    </div>
  );
};

export function TestimonialGrid() {
  const [test0, test1, test2, test3] = testimonials as [
    TestimonialCardProps,
    TestimonialCardProps,
    TestimonialCardProps,
    TestimonialCardProps,
  ];

  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start py-6 md:py-8 lg:py-14">
      <div className="text-center mb-12">
        {/* Subtle accent line */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8" />

        <h2 className="text-foreground text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6 tracking-tight">
          Trading
          <br />
          <span className="font-medium text-primary">sin esfuerzo</span>
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
          Escucha cómo traders escalan sus operaciones más rápido, colaboran sin
          problemas, y operan con confianza usando las poderosas herramientas de
          FENIZ
        </p>
      </div>
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {/* Primera columna - Testimonio principal */}
        <div className="lg:col-span-1">
          <TestimonialCard {...test0} />
        </div>
        {/* Segunda columna - 2 testimonios pequeños */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <TestimonialCard {...test1} />
          <TestimonialCard {...test3} />
        </div>
        {/* Tercera columna - 1 testimonio grande */}
        <div className="lg:col-span-1">
          <TestimonialCard {...test2} />
        </div>
      </div>
    </section>
  );
}
