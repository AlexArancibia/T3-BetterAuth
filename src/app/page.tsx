"use client";

import { useAuthContext } from "@/AuthContext";
import { AnimatedSection } from "@/components/landing/animated-section";
import { BentoSection } from "@/components/landing/bento-section";
import { CTASection } from "@/components/landing/cta-section";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingHero } from "@/components/landing/landing-hero";
import { PricingSection } from "@/components/landing/pricing-section";
import { SocialProof } from "@/components/landing/social-proof";
import { TestimonialGrid } from "@/components/landing/testimonial-grid";

export default function HomePage() {
  const { loading } = useAuthContext();

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

  // Landing page para usuarios no autenticados y autenticados
  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <LandingHero />
        {/* Dashboard Preview Wrapper - positioned to be cut by hero curve */}
        <div className="relative z-30 -mt-[230px] md:-mt-[320px] px-4">
          <div className="container mx-auto max-w-[1080px]">
            <AnimatedSection>
              <DashboardPreview />
            </AnimatedSection>
          </div>
        </div>
        <AnimatedSection
          className="relative container mx-auto px-4 mt-[180px] md:mt-[220px]"
          delay={0.1}
        >
          <SocialProof />
        </AnimatedSection>
        <AnimatedSection
          id="features-section"
          className="relative w-full mt-16 md:mt-20"
          delay={0.2}
        >
          <BentoSection />
        </AnimatedSection>
        <AnimatedSection
          id="pricing-section"
          className="relative w-full mt-16 md:mt-20"
          delay={0.2}
        >
          <PricingSection />
        </AnimatedSection>
        <AnimatedSection
          id="testimonials-section"
          className="relative container mx-auto mt-16 md:mt-20"
          delay={0.2}
        >
          <TestimonialGrid />
        </AnimatedSection>
        <AnimatedSection
          id="faq-section"
          className="relative w-full mt-16 md:mt-20"
          delay={0.2}
        >
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection
          className="relative w-full mt-16 md:mt-20 mb-0"
          delay={0.2}
        >
          <CTASection />
        </AnimatedSection>
      </div>
    </div>
  );
}
