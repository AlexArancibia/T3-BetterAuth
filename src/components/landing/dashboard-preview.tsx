import Image from "next/image";

export function DashboardPreview() {
  return (
    <div className="w-full max-w-[1080px] mx-auto px-4">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
        <Image
          src="/images/dashboard-preview.png"
          alt="Dashboard Preview"
          width={1080}
          height={720}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
}
