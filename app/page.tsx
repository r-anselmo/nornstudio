import { ChatFlowSection } from '@/components/chat-flow-section'
import { CtaSection } from '@/components/cta-section'
import { HeroSection } from '@/components/hero-section'
import { ServicesSection } from '@/components/services-section'
import { SiteFooter } from '@/components/site-footer'
import { WhatWeDoSection } from '@/components/what-we-do-section'

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhatWeDoSection />
      <ChatFlowSection />
      <ServicesSection />
      <CtaSection />
      <SiteFooter />
    </>
  )
}
