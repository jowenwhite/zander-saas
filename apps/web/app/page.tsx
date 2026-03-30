'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Check icon for lists
const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" width={10} height={10}>
    <polyline points="1.5,6 4.5,9 10.5,3"/>
  </svg>
);

// Play icon
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

// Plus/Minus icons for FAQ
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const MinusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// Brand colors for executives
const BRAND_COLORS = {
  teal: '#00CFEB',
  amber: '#F57C00',
  green: '#2E7D32',
  purple: '#5E35B1',
};

// Pillar icons with unique colors
const OrganizedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={BRAND_COLORS.teal} strokeWidth="2" strokeLinecap="round" width={28} height={28}>
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ExecutingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={BRAND_COLORS.amber} strokeWidth="2" strokeLinecap="round" width={28} height={28}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const GrowingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={BRAND_COLORS.green} strokeWidth="2" strokeLinecap="round" width={28} height={28}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const CompleteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke={BRAND_COLORS.purple} strokeWidth="2" strokeLinecap="round" width={28} height={28}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

// Section divider component
const SectionDivider = () => (
  <div style={{
    width: '100%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(0,207,235,0.4) 50%, transparent 100%)',
    margin: '0 auto',
    maxWidth: '600px',
  }} />
);

// Animation variants - using cubic bezier for easeOut
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } }
};

const pillarScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } }
};

// Animated counter component
function AnimatedCounter({ end, duration = 1.5, highlight = false }: { end: number; duration?: number; highlight?: boolean }) {
  const [count, setCount] = useState(50);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const startTime = Date.now();
      const startValue = 50;
      const endValue = end;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
        const current = Math.round(startValue - (startValue - endValue) * eased);
        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return (
    <span
      ref={ref}
      style={highlight ? {
        color: '#00CFEB',
        fontSize: '1.2em',
        fontWeight: 900,
      } : undefined}
    >
      {count}
    </span>
  );
}

// Section wrapper with scroll animation
function AnimatedSection({ children, className, style, id }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWaitlistClick = async () => {
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'waitlist' })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Waitlist error:', err);
    }
  };

  const faqs = [
    {
      q: "What does 'locked for life' actually mean?",
      a: "Your monthly rate never increases. As we add new executives and features, founding members get them included at no additional cost."
    },
    {
      q: "What is the $49 waitlist fee for?",
      a: "It reserves your place in the next onboarding cohort. We onboard in small, managed groups to ensure every new member gets proper attention. The $49 is non-refundable."
    },
    {
      q: "What integrations does Zander support?",
      a: "Gmail, Google Calendar, Google Drive, Outlook, Twilio (SMS), Calendly, Stripe, and more. New integrations are added regularly."
    },
    {
      q: "Is this just another AI chatbot?",
      a: "No. Zander's executives connect to your real business tools and take real actions — sending drafts for approval, booking calendar events, managing your pipeline, running marketing sequences. They don't just answer questions."
    },
    {
      q: "What happens to my data?",
      a: "Your data is yours. Each business is fully isolated. We do not share or sell your data."
    }
  ];

  return (
    <div className="landing-page" style={{
      fontFamily: "'Inter', var(--font-inter), sans-serif",
      background: '#080A0F',
      color: '#FFFFFF',
      lineHeight: 1.65,
      WebkitFontSmoothing: 'antialiased',
      fontSize: '20px',
    }}>
      <style>{`
        @keyframes ambientPulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .testimonial-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        .pricing-card {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .pricing-card:hover {
          border-color: rgba(0,207,235,0.4);
          box-shadow: 0 0 20px rgba(0,207,235,0.1);
        }
        .pricing-card-pro {
          animation: proGlow 2s ease-in-out infinite;
        }
        @keyframes proGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(245,124,0,0.2); }
          50% { box-shadow: 0 0 30px rgba(245,124,0,0.35); }
        }
        @media (max-width: 1100px) {
          .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .waitlist-inner { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .pillar-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 960px) {
          .pain-grid, .freedom-grid, .testi-grid, .steps-grid { grid-template-columns: 1fr !important; }
          .exec-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .exec-row-2 { grid-template-columns: repeat(2, 1fr) !important; max-width: 100% !important; }
          .founder-grid { grid-template-columns: 1fr !important; }
          .founder-logo-wrap { max-width: 280px !important; margin: 0 auto !important; }
          .freedom-header { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .nav-links-desktop { display: none !important; }
          .pillar-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        minHeight: '100px',
        padding: '28px 2rem',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(8,10,15,0.88)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a href="#" style={{ display: 'block', textDecoration: 'none' }}>
            <img src="/images/zander-logo-white.svg" alt="Zander" style={{ height: '64px', width: 'auto' }} />
          </a>
          <ul className="nav-links-desktop" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.25rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}>
            <li><a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '20px', fontWeight: 500 }}>Product</a></li>
            <li><a href="#pricing" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '20px', fontWeight: 500 }}>Pricing</a></li>
            <li><a href="#demo" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '20px', fontWeight: 500 }}>Demo</a></li>
            <li><a href="#about" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '20px', fontWeight: 500 }}>About</a></li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '20px', fontWeight: 500 }}>Sign In</a>
            <a href="/signup" style={{
              background: '#00CFEB',
              color: '#000',
              padding: '16px 32px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '20px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>Get Early Access</a>
          </div>
        </div>
      </nav>

      {/* HERO with layered gradient background */}
      <section id="product" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        paddingTop: '120px',
        paddingLeft: '2rem',
        paddingRight: '2rem',
        paddingBottom: '80px',
        position: 'relative',
        overflow: 'visible',
      }}>
        {/* Layer 1 (bottom): static base */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#0a1628',
          pointerEvents: 'none',
        }} />
        {/* Layer 2: static radial gradients */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(0, 188, 212, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0, 82, 120, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
        {/* Layer 3: animated opacity radial gradients */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 70% 80%, rgba(0, 150, 180, 0.1) 0%, transparent 55%), radial-gradient(ellipse at 30% 30%, rgba(0, 60, 100, 0.12) 0%, transparent 50%)',
          animation: 'ambientPulse 12s ease-in-out infinite',
          willChange: 'opacity',
          transform: 'translateZ(0)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#13151E',
              border: '1px solid rgba(0,207,235,0.28)',
              color: 'rgba(255,255,255,0.72)',
              padding: '10px 20px',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              marginBottom: '2.5rem',
            }}
          >
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 8px #22C55E',
              flexShrink: 0,
            }} />
            Now in Beta — Founding 50 spots available
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              marginBottom: '40px',
            }}
          >
            <span style={{ display: 'block', color: '#FFFFFF', fontSize: '120px', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em' }}>Your business,</span>
            <span style={{ display: 'block', color: '#00CFEB', fontSize: '120px', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em' }}>expertly run.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            style={{
              fontSize: '26px',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '700px',
              margin: '0 auto 24px',
              lineHeight: 1.6,
            }}
          >
            You built something real. Zander gives you the expert executive team to keep it organized, moving forward, and growing — so you can step back into the work you actually love.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.55)',
              maxWidth: '680px',
              margin: '0 auto 48px',
              lineHeight: 1.7,
            }}
          >
            An AI-powered executive team that handles your inbox, drives your pipeline, runs your marketing, and manages your operations — so nothing falls through the cracks. Not even the things you&apos;ve been ignoring.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
            style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}
          >
            <a href="/signup" style={{
              background: '#00CFEB',
              color: '#000',
              padding: '20px 48px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '22px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              Get Early Access
            </a>
            <a href="#demo" style={{
              background: 'transparent',
              color: '#FFFFFF',
              padding: '20px 40px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '22px',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <PlayIcon />
              Watch 3-Minute Demo
            </a>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{ fontSize: '18px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}
          >
            Joining 50 founding members &bull; Founding rate locked for life
          </motion.p>
        </div>
      </section>

      {/* PAIN POINT - Scroll-triggered stagger */}
      <AnimatedSection style={{ padding: '100px 2rem', background: 'linear-gradient(180deg, transparent 0%, rgba(0,207,235,0.02) 50%, transparent 100%)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontSize: '56px',
              fontWeight: 800,
              marginBottom: '56px',
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              color: '#00CFEB',
            }}
          >
            Sound familiar?
          </motion.h2>

          <motion.div
            className="pain-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', textAlign: 'left' }}
          >
            {[
              "You're working harder than anyone you know — and still feel behind.",
              "There are parts of your business you know need attention. You just never get there.",
              "You've always wished you had an expert in the room for the things that aren't your strengths.",
              "The guilt of unfinished tasks follows you home every night.",
              "You didn't start a business to spend your days buried in emails and admin.",
            ].map((pain, i) => {
              const borderColors = [BRAND_COLORS.teal, BRAND_COLORS.amber, BRAND_COLORS.teal, BRAND_COLORS.amber, BRAND_COLORS.teal];
              return (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  style={{
                    background: '#0E1017',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderLeft: `4px solid ${borderColors[i]}`,
                    borderRadius: '0 12px 12px 0',
                    padding: '28px 32px',
                  }}
                >
                  <p style={{
                    fontSize: '26px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}>
                    {pain}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontSize: '26px',
              fontWeight: 600,
              color: '#00CFEB',
              marginTop: '48px',
              letterSpacing: '-0.01em',
            }}
          >
            That&apos;s exactly why Zander exists.
          </motion.p>
        </div>
      </AnimatedSection>

      {/* Section Divider */}
      <SectionDivider />

      {/* THE ZANDER DIFFERENCE - Scroll-triggered pillar scale */}
      <AnimatedSection id="how-it-works" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#00CFEB',
              marginBottom: '16px',
              display: 'block',
            }}>The Zander Difference</span>
            <h2 style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontSize: '52px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              marginBottom: '24px',
              maxWidth: '700px',
              margin: '0 auto 24px',
            }}>
              It&apos;s not software. It&apos;s a fully staffed executive team.
            </h2>
            <p style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '750px',
              margin: '0 auto',
              lineHeight: 1.75,
            }}>
              Zander doesn&apos;t give you another dashboard to manage. It gives you a CMO who runs your marketing, a CRO who works your pipeline, and an EA who handles your inbox and schedule — all operating inside a single platform built around how a real business runs. And it gets your business organized and fully functioning on all fronts. Including the ones you&apos;ve been putting off.
            </p>
          </motion.div>

          <motion.div
            className="pillar-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}
          >
            {[
              { icon: <OrganizedIcon />, title: 'Organized', desc: 'Your operations, communications, and schedule running in sync.' },
              { icon: <ExecutingIcon />, title: 'Executing', desc: 'Your executives take action. They don\'t just advise.' },
              { icon: <GrowingIcon />, title: 'Growing', desc: 'Pipeline, marketing, and outreach working while you focus on delivery.' },
              { icon: <CompleteIcon />, title: 'Complete', desc: 'Every part of your business covered. Nothing left unattended.' },
            ].map((pillar, i) => (
              <motion.div
                key={i}
                variants={pillarScale}
                style={{
                  background: '#0E1017',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '2rem',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(0,207,235,0.08)',
                  border: '1px solid rgba(0,207,235,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}>
                  {pillar.icon}
                </div>
                <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '26px', fontWeight: 700, marginBottom: '12px', color: '#00CFEB' }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>{pillar.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* HOW IT WORKS */}
      <AnimatedSection id="demo" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#00CFEB',
              marginBottom: '16px',
              display: 'block',
            }}
          >How It Works</motion.span>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontSize: '52px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              marginBottom: '56px',
            }}
          >Three steps to freedom</motion.h2>

          <motion.div
            className="steps-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}
          >
            {[
              { num: '01', title: 'Connect', desc: 'Connect your inbox, calendar, and integrations in minutes.' },
              { num: '02', title: 'Activate', desc: 'Your executive team activates — Pam, Jordan, Don, and more get to work.' },
              { num: '03', title: 'Run', desc: 'Your business runs. You stay informed and in control without being buried.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                style={{
                  background: '#0E1017',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '2.5rem 2rem',
                }}
              >
                <div style={{
                  fontFamily: "'Sora', var(--font-sora), sans-serif",
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'rgba(0,207,235,0.3)',
                  marginBottom: '1rem',
                }}>{step.num}</div>
                <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '26px', fontWeight: 700, marginBottom: '12px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '22px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Video placeholder */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              background: '#0E1017',
              border: '2px dashed rgba(0,207,235,0.3)',
              borderRadius: '16px',
              padding: '5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(0,207,235,0.15)',
              border: '2px solid rgba(0,207,235,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#00CFEB">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p style={{ fontSize: '1.15rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              3-Minute Demo — Coming Soon
            </p>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              See Zander in action
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Section Divider */}
      <SectionDivider />

      {/* FOUNDING 50 / URGENCY with animated counter */}
      <AnimatedSection style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, rgba(0,207,235,0.04) 0%, transparent 60%)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#13151E',
              border: '1px solid rgba(0,207,235,0.28)',
              color: 'rgba(255,255,255,0.7)',
              padding: '8px 20px',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              marginBottom: '24px',
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 8px #22C55E',
            }} />
            Limited — Founding 50 Only
          </motion.div>

          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontSize: '64px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '20px',
            }}
          >
            Founding 50 — <AnimatedCounter end={12} highlight /> Spots Remaining
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontSize: '24px',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.75,
              marginBottom: '40px',
              maxWidth: '650px',
              margin: '0 auto 40px',
            }}
          >
            Founding members get their rate locked for life — including every new executive as they launch. No upgrades required. No price increases. Ever.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}
          >
            <a href="/signup" style={{
              background: '#00CFEB',
              color: '#000',
              padding: '18px 40px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '22px',
              textDecoration: 'none',
            }}>
              Claim Your Founding Spot
            </a>
            <button
              onClick={handleWaitlistClick}
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                padding: '18px 40px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '22px',
                border: '1px solid rgba(255,255,255,0.18)',
                cursor: 'pointer',
              }}
            >
              Join the Waitlist ($49)
            </button>
          </motion.div>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: '0 auto' }}
          >
            Spots filled? The $49 waitlist fee reserves your place in the next onboarding cohort. Non-refundable. Next batch pricing announced separately.
          </motion.p>
        </div>
      </AnimatedSection>

      {/* Section Divider */}
      <SectionDivider />

      {/* TESTIMONIALS with hover lift */}
      <AnimatedSection style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#00CFEB',
              marginBottom: '16px',
              display: 'block',
            }}
          >From Our Founding Members</motion.span>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontSize: '52px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              marginBottom: '20px',
            }}
          >Real results from real business owners</motion.h2>

          <motion.div
            className="testi-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginTop: '3.5rem',
            }}
          >
            {[
              {
                quote: '"I was spending Sunday nights catching up on emails I should have answered Tuesday. Pam handles my follow-up, Jordan works every lead I can\'t get to, and I actually took a full weekend off last month for the first time in years."',
                name: 'Independent Real Estate Broker',
              },
              {
                quote: '"We build systems for our clients every day. Our own business was the one we kept ignoring. Zander gave us the structure we\'ve been selling to everyone else. Don runs our marketing calendar and Jordan follows up on every proposal we send."',
                name: 'Founder, Digital Marketing Agency',
              },
              {
                quote: '"I run a seven-figure contracting business from my truck. Pam handles my inbox while I\'m on job sites, Jordan follows up on every estimate I send, and I stopped losing work to guys who just answer the phone faster."',
                name: 'Owner, Specialty Contracting Business',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="testimonial-card"
                style={{
                  background: '#0E1017',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderTop: '2px solid rgba(0,207,235,0.4)',
                  borderRadius: '14px',
                  padding: '2rem',
                }}
              >
                <p style={{
                  fontSize: '22px',
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.78,
                  marginBottom: '24px',
                  fontStyle: 'italic',
                }}>{t.quote}</p>
                <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  — {t.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* FREEDOM FOR FOUNDERS */}
      <AnimatedSection id="about" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#00CFEB',
              marginBottom: '16px',
              display: 'block',
            }}
          >From the Founder</motion.span>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '3rem',
            }}
          >
            <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.85 }}>
              <p style={{ marginBottom: '24px' }}>
                I&apos;ve owned and operated multiple businesses for decades — manufacturing, retail, technology. I&apos;ve read hundreds of books, attended seminars, joined networking groups, and consulted for dozens of small business owners. I&apos;ve had a front-row seat to more businesses than most people see in a lifetime.
              </p>
              <p style={{ marginBottom: '24px' }}>
                And in every single one — including my own — I saw the same thing: founders working harder than anyone in the room, and still falling behind on the things that matter most.
              </p>
              <p style={{ marginBottom: '24px' }}>
                Not because they weren&apos;t capable. Because there weren&apos;t enough hours, and the right help was always too expensive, too slow, or too complicated to set up. A fractional CMO costs $5,000 a month and gives you strategy. A fractional CRO costs $3,000 a month and gives you a deck. A part-time VA costs $2,000 a month and handles your calendar when she&apos;s available.
              </p>
              <p style={{ marginBottom: '24px' }}>
                None of them are in your business every day. None of them work together. None of them are built around how a small business actually runs.
              </p>
              <p style={{ marginBottom: 0, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                I built Zander because I needed it. And because every business owner I&apos;ve ever worked with needed it too.
              </p>
            </div>

            <div style={{
              marginTop: '40px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(0,207,235,0.12)',
                border: '1px solid rgba(0,207,235,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Sora', var(--font-sora), sans-serif",
                fontWeight: 700,
                color: '#00CFEB',
                fontSize: '22px',
                flexShrink: 0,
              }}>JW</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '22px', lineHeight: 1.3 }}>Jonathan White</div>
                <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>Founder — Zander</div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Section Divider */}
      <SectionDivider />

      {/* PRICING with hover glow */}
      <AnimatedSection id="pricing" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.span
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#00CFEB',
              marginBottom: '16px',
              display: 'block',
            }}
          >Founding 50 Rates — Locked for Life</motion.span>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontSize: '56px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              marginBottom: '16px',
            }}
          >Simple, transparent pricing</motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.55)',
              marginBottom: '56px',
            }}
          >
            Public pricing launches higher after beta. These rates never increase for founding members.
          </motion.p>

          <motion.div
            className="pricing-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.1rem',
              textAlign: 'left',
            }}
          >
            {/* STARTER */}
            <motion.div variants={staggerItem} className="pricing-card" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderTop: `3px solid ${BRAND_COLORS.teal}`,
              borderRadius: '16px',
              padding: '2.25rem',
              position: 'relative',
            }}>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '28px', fontWeight: 700, marginBottom: '6px', color: BRAND_COLORS.teal }}>Starter</h3>
              <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.5 }}>Your EA and HQ — fully operational from day one.</p>
              <div style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '52px', fontWeight: 800, lineHeight: 1, marginBottom: '6px' }}>
                $199<span style={{ fontSize: '20px', fontWeight: 500, color: 'rgba(255,255,255,0.58)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginBottom: '28px' }}>$299/mo public</p>
              <a href="/signup" style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '20px',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '28px',
                background: 'transparent',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.18)',
                boxSizing: 'border-box',
              }}>Get Early Access</a>
              <p style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Includes</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
                {[
                  'Pam, your AI Executive Assistant',
                  'HQ — your business command center',
                  'Inbox management and draft routing',
                  'Calendar and scheduling',
                  'SMS and follow-up sequences',
                  'Getting sharper every day',
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '18px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
                    <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', color: '#00CFEB' }}><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* PRO (featured) */}
            <motion.div variants={staggerItem} className="pricing-card pricing-card-pro" style={{
              background: '#13151E',
              border: `1px solid ${BRAND_COLORS.amber}`,
              borderTop: `3px solid ${BRAND_COLORS.amber}`,
              borderRadius: '16px',
              padding: '2.25rem',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-13px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: BRAND_COLORS.amber,
                color: '#000',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.28rem 0.9rem',
                borderRadius: '50px',
                whiteSpace: 'nowrap',
              }}>Most Popular</div>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '28px', fontWeight: 700, marginBottom: '6px', color: BRAND_COLORS.amber }}>Pro</h3>
              <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.5 }}>Add your marketing machine — campaigns, brand, and content.</p>
              <div style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '52px', fontWeight: 800, lineHeight: 1, marginBottom: '6px' }}>
                $349<span style={{ fontSize: '20px', fontWeight: 500, color: 'rgba(255,255,255,0.58)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginBottom: '28px' }}>$499/mo public</p>
              <a href="/signup" style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '20px',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '28px',
                background: BRAND_COLORS.amber,
                color: '#000',
                border: 'none',
                boxSizing: 'border-box',
              }}>Get Early Access</a>
              <p style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Everything in Starter, plus</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
                {[
                  'Don, your AI CMO',
                  'Marketing calendar and campaign execution',
                  'Brand and content strategy',
                  'Social and email sequences',
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '18px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
                    <span style={{ width: '18px', height: '18px', background: 'rgba(245,124,0,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', color: BRAND_COLORS.amber }}><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* BUSINESS */}
            <motion.div variants={staggerItem} className="pricing-card" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderTop: `3px solid ${BRAND_COLORS.green}`,
              borderRadius: '16px',
              padding: '2.25rem',
              position: 'relative',
            }}>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '28px', fontWeight: 700, marginBottom: '6px', color: BRAND_COLORS.green }}>Business</h3>
              <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.5 }}>The complete C-suite. Every executive included, forever.</p>
              <div style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '52px', fontWeight: 800, lineHeight: 1, marginBottom: '6px' }}>
                $599<span style={{ fontSize: '20px', fontWeight: 500, color: 'rgba(255,255,255,0.58)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginBottom: '28px' }}>$799/mo public</p>
              <a href="/signup" style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '20px',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '28px',
                background: 'transparent',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.18)',
                boxSizing: 'border-box',
              }}>Get Early Access</a>
              <p style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Everything in Pro, plus</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
                {[
                  'Jordan, your AI CRO',
                  'Pipeline management and deal tracking',
                  'Outreach sequences and lead follow-up',
                  'Full executive team operating in sync',
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '18px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
                    <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', color: '#00CFEB' }}><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* ENTERPRISE */}
            <motion.div variants={staggerItem} className="pricing-card" style={{
              background: 'linear-gradient(135deg, #0E1017 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderTop: `3px solid ${BRAND_COLORS.purple}`,
              borderRadius: '16px',
              padding: '2.25rem',
              position: 'relative',
            }}>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '28px', fontWeight: 700, marginBottom: '6px', color: BRAND_COLORS.purple }}>Enterprise</h3>
              <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.5 }}>Custom build for complex organizations and agencies.</p>
              <div style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '52px', fontWeight: 800, lineHeight: 1, marginBottom: '6px' }}>
                $999<span style={{ fontSize: '20px', fontWeight: 500, color: 'rgba(255,255,255,0.58)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginBottom: '28px' }}>$1,499/mo public</p>
              <a href="mailto:support@zanderos.com" style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '20px',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '28px',
                background: 'transparent',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.18)',
                boxSizing: 'border-box',
              }}>Contact Us</a>
              <p style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Everything in Business, plus</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
                {[
                  'Custom executive configuration',
                  'Multi-location and team support',
                  'Priority onboarding and dedicated support',
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '18px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
                    <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', color: '#00CFEB' }}><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* 30-Day Guarantee */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              marginTop: '40px',
              background: 'rgba(0,207,235,0.05)',
              border: '1px solid rgba(0,207,235,0.2)',
              borderRadius: '12px',
              padding: '24px 32px',
              maxWidth: '700px',
              margin: '40px auto 0',
            }}
          >
            <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.85)', marginBottom: '8px', fontWeight: 600 }}>
              30-Day Money-Back Guarantee
            </p>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
              If Zander isn&apos;t running your business better in the first 30 days, we&apos;ll refund your first month. No questions. No hassle.
            </p>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)' }}>
              The $49 waitlist reservation fee is non-refundable. The 30-day guarantee applies to your first month&apos;s subscription payment only.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* FAQ with AnimatePresence */}
      <AnimatedSection style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontSize: '52px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              marginBottom: '40px',
              textAlign: 'center',
            }}
          >Frequently Asked Questions</motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                style={{
                  background: '#0E1017',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '22px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{faq.q}</span>
                  <span style={{ color: '#00CFEB', flexShrink: 0 }}>
                    {openFaq === i ? <MinusIcon /> : <PlusIcon />}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 24px 20px', fontSize: '20px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* FINAL CTA */}
      <AnimatedSection style={{
        padding: '7rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 65% 85% at 50% 50%, rgba(0,207,235,0.055) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInUp}
          style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}
        >
          <h2 style={{
            fontFamily: "'Sora', var(--font-sora), sans-serif",
            fontSize: '56px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            lineHeight: 1.2,
          }}>
            Your business is ready.<br/><span style={{ color: '#00CFEB' }}>Are you?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '22px', marginBottom: '36px', lineHeight: 1.75 }}>
            Join the Founding 50 and get expert-level executive support locked in for life — before we open to the public and pricing goes up.
          </p>
          <a href="/signup" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#00CFEB',
            color: '#000',
            padding: '20px 48px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '22px',
            textDecoration: 'none',
          }}>
            Get Early Access
          </a>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)', marginTop: '16px', letterSpacing: '0.04em' }}>
            Only 50 founding spots &bull; No credit card required &bull; Cancel anytime
          </p>
        </motion.div>
      </AnimatedSection>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '3rem 2rem 2rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            <div>
              <a href="#" style={{ display: 'block', textDecoration: 'none', marginBottom: '12px' }}>
                <img src="/images/zander-logo-white.svg" alt="Zander" style={{ height: '48px', width: 'auto' }} />
              </a>
              <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)' }}>Your business, expertly run.</p>
            </div>
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '18px' }}>Product</a>
                <a href="#pricing" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '18px' }}>Pricing</a>
                <a href="#demo" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '18px' }}>Demo</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#about" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '18px' }}>About</a>
                <a href="/login" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '18px' }}>Sign In</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="/privacy" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '18px' }}>Privacy Policy</a>
                <a href="/terms" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '18px' }}>Terms of Service</a>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              &copy; 2026 Zander Systems LLC. All rights reserved.
            </p>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              support@zanderos.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
