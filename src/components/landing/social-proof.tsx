export function SocialProof() {
  const stats = [
    { value: "< 50ms", label: "Latencia Ultra-Baja" },
    { value: "24/7", label: "Monitoreo Continuo" },
    { value: "50+", label: "PropFirms Soportadas" },
  ];

  return (
    <div className="w-full py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
