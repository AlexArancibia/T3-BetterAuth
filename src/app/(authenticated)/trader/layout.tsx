import { TraderSidebar } from "@/components/trader/TraderSidebar";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Trading Platform",
  description:
    "Plataforma de trading profesional para gestionar tus cuentas propfirm y broker de forma eficiente.",
  keywords: [
    "trading",
    "propfirm",
    "broker",
    "gestión",
    "cuentas",
    "copy trading",
  ],
});

export default function TraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Container principal con ancho máximo de 1500px */}
        <div className="max-w-[1500px] py-8 mx-auto">
          <div className="flex h-full">
            {/* Primer div - delgado para el sidebar (oculto en móvil) */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <TraderSidebar />
            </div>

            {/* Segundo div - contenido principal */}
            <div className="flex-1 overflow-auto bg-background">
              <div className="">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
