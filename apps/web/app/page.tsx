'use client';

import { useEffect, useRef } from 'react';

// Compass Z SVG Component (reusable)
const CompassLogo = ({ size = 36 }: { size?: number }) => (
  <svg viewBox="0 0 64 64" fill="none" width={size} height={size}>
    <circle cx="32" cy="32" r="30" stroke="#00CFEB" strokeWidth="2"/>
    <circle cx="32" cy="32" r="22" stroke="#00CFEB" strokeWidth="1" strokeDasharray="2 5" opacity="0.5"/>
    <polygon points="32,6 35.5,19 28.5,19" fill="#00CFEB"/>
    <polygon points="32,58 35.5,45 28.5,45" fill="rgba(0,207,235,0.25)"/>
    <path d="M22 24L42 24L22 40L42 40" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Large Compass for Founder section
const CompassLogoLarge = () => (
  <svg viewBox="0 0 200 200" fill="none" style={{ width: '58%' }}>
    <circle cx="100" cy="100" r="90" stroke="#00CFEB" strokeWidth="2.5"/>
    <circle cx="100" cy="100" r="70" stroke="#00CFEB" strokeWidth="1.5" strokeDasharray="4 9" opacity="0.45"/>
    <circle cx="100" cy="100" r="50" stroke="#00CFEB" strokeWidth="1" opacity="0.2"/>
    <polygon points="100,14 107,46 93,46" fill="#00CFEB"/>
    <polygon points="100,186 107,154 93,154" fill="rgba(0,207,235,0.2)"/>
    <line x1="14" y1="100" x2="28" y2="100" stroke="#00CFEB" strokeWidth="2" opacity="0.45"/>
    <line x1="172" y1="100" x2="186" y2="100" stroke="#00CFEB" strokeWidth="2" opacity="0.45"/>
    <path d="M68 76L132 76L68 124L132 124" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="100" cy="100" r="4" fill="#00CFEB"/>
  </svg>
);

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

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    document.querySelectorAll('.fade-up').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div style={{
      fontFamily: "'Inter', var(--font-inter), sans-serif",
      background: '#080A0F',
      color: '#FFFFFF',
      lineHeight: 1.65,
      WebkitFontSmoothing: 'antialiased',
      fontSize: '17px',
    }}>
      <style>{`
        .fade-up {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 1100px) {
          .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .waitlist-inner { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
        @media (max-width: 960px) {
          .pain-grid, .freedom-grid, .testi-grid { grid-template-columns: 1fr !important; }
          .exec-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .exec-row-2 { grid-template-columns: repeat(2, 1fr) !important; max-width: 100% !important; }
          .founder-grid { grid-template-columns: 1fr !important; }
          .founder-logo-wrap { max-width: 280px !important; margin: 0 auto !important; }
          .freedom-header { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .nav-links-desktop { display: none !important; }
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
        height: '68px',
        padding: '0 2rem',
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
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <CompassLogo size={36} />
            <span style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontWeight: 700,
              fontSize: '1.15rem',
              letterSpacing: '0.09em',
              color: '#FFFFFF',
            }}>ZANDER</span>
          </a>
          <ul className="nav-links-desktop" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.25rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}>
            <li><a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Product</a></li>
            <li><a href="#pricing" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Pricing</a></li>
            <li><a href="#demo" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Demo</a></li>
            <li><a href="#about" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>About</a></li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Sign In</a>
            <a href="/signup" style={{
              background: '#00CFEB',
              color: '#000',
              padding: '0.58rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>Get Early Access</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="product" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '8rem 2rem 5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 65% at 50% 25%, rgba(0,207,235,0.07) 0%, transparent 65%), radial-gradient(ellipse 45% 45% at 15% 85%, rgba(0,207,235,0.04) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '860px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#13151E',
            border: '1px solid rgba(0,207,235,0.28)',
            color: 'rgba(255,255,255,0.72)',
            padding: '0.42rem 1.1rem',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 500,
            letterSpacing: '0.04em',
            marginBottom: '2rem',
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 8px #22C55E',
              flexShrink: 0,
            }} />
            Now in Beta — Founding 50 spots available
          </div>

          <h1 style={{
            fontFamily: "'Sora', var(--font-sora), sans-serif",
            fontSize: 'clamp(3rem, 6.5vw, 5.25rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: '1.6rem',
            letterSpacing: '-0.025em',
          }}>
            <span style={{ display: 'block', color: '#FFFFFF' }}>Your Business.</span>
            <span style={{ display: 'block', color: '#00CFEB' }}>Expertly Run.</span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.58)',
            maxWidth: '580px',
            margin: '0 auto 2.75rem',
            lineHeight: 1.8,
          }}>
            You built something real. Zander gives you the expert executive team to keep it organized, moving forward, and growing — so you can step back into the work you actually love.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
            <a href="/signup" style={{
              background: '#00CFEB',
              color: '#000',
              padding: '0.9rem 2rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.97rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              Get Early Access — from $199/mo founding rate
            </a>
            <a href="#demo" style={{
              background: 'transparent',
              color: '#FFFFFF',
              padding: '0.9rem 2rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.97rem',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <PlayIcon />
              Watch 3-Min Demo
            </a>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>
            Joining 50 founding members &bull; Founding rate locked for life
          </p>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="fade-up" style={{
            fontFamily: "'Sora', var(--font-sora), sans-serif",
            fontSize: 'clamp(1.85rem, 3.8vw, 2.75rem)',
            fontWeight: 800,
            marginBottom: '0.75rem',
            lineHeight: 1.18,
            letterSpacing: '-0.02em',
            maxWidth: '680px',
          }}>
            You didn&apos;t start your business to spend your days buried in it.
          </h2>
          <p className="fade-up" style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.58)',
            maxWidth: '600px',
            marginBottom: '3.25rem',
            lineHeight: 1.8,
          }}>
            But somewhere along the way, the emails, the follow-ups, the books, the marketing — it all piled up. And the thing you actually built the business for? It keeps getting pushed to tomorrow.
          </p>

          <div className="pain-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            <div className="fade-up" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '2rem',
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                background: '#13151E',
                border: '1px solid rgba(0,207,235,0.22)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00CFEB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '0.7rem', lineHeight: 1.3 }}>
                Revenue slips through the cracks
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>
                You&apos;re on a job, in a meeting, putting out a fire. By the time you follow up on that lead, they&apos;ve already signed with someone else.
              </p>
            </div>

            <div className="fade-up" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '2rem',
              transitionDelay: '0.1s',
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                background: '#13151E',
                border: '1px solid rgba(0,207,235,0.22)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00CFEB" strokeWidth="2" strokeLinecap="round" width={22} height={22}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '0.7rem', lineHeight: 1.3 }}>
                Marketing stays on the to-do list
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>
                You know you should be building your brand, posting, emailing customers. But running the business always wins. So it never happens.
              </p>
            </div>

            <div className="fade-up" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '2rem',
              transitionDelay: '0.2s',
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                background: '#13151E',
                border: '1px solid rgba(0,207,235,0.22)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00CFEB" strokeWidth="2" strokeLinecap="round" width={22} height={22}>
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '0.7rem', lineHeight: 1.3 }}>
                You&apos;re IN the business, not ON it
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>
                The bigger picture — growth, strategy, what&apos;s next — keeps getting sacrificed to today&apos;s urgent problems. You&apos;re too busy to build what comes next.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FREEDOM / HOW IT WORKS */}
      <section id="how-it-works" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,207,235,0.025) 40%, transparent 100%)',
        padding: '6rem 2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="fade-up freedom-header" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'end',
            marginBottom: '4rem',
          }}>
            <div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#00CFEB',
                marginBottom: '0.85rem',
                display: 'block',
              }}>The Zander Difference</span>
              <h2 style={{
                fontFamily: "'Sora', var(--font-sora), sans-serif",
                fontSize: 'clamp(1.9rem, 4vw, 2.85rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.18,
                marginBottom: 0,
              }}>
                Your business, organized and moving forward. You, focused on what matters.
              </h2>
            </div>
            <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.8 }}>
              Zander puts a full executive team in your corner — not software you have to manage, but AI executives who already know your business, execute on your behalf, and keep everything running while you focus on the priorities and the work you love.
            </div>
          </div>

          <div className="freedom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            <div className="fade-up" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '2rem',
            }}>
              <div style={{
                fontFamily: "'Sora', var(--font-sora), sans-serif",
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#00CFEB',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>01 — Always On</div>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem', lineHeight: 1.3 }}>
                Nothing falls through the cracks
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>
                Your pipeline stays current. Your follow-ups go out. Your books stay clean. Zander keeps every part of your business moving without you managing it.
              </p>
            </div>

            <div className="fade-up" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '2rem',
              transitionDelay: '0.1s',
            }}>
              <div style={{
                fontFamily: "'Sora', var(--font-sora), sans-serif",
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#00CFEB',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>02 — Expert Level</div>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem', lineHeight: 1.3 }}>
                Executive-grade thinking, not just automation
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>
                Each AI executive is trained on your business. They don&apos;t just execute tasks — they bring strategy, insight, and the kind of thinking you&apos;d expect from a $200K hire.
              </p>
            </div>

            <div className="fade-up" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '2rem',
              transitionDelay: '0.2s',
            }}>
              <div style={{
                fontFamily: "'Sora', var(--font-sora), sans-serif",
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#00CFEB',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>03 — True Freedom</div>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem', lineHeight: 1.3 }}>
                Step back into what you love
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>
                Whether that&apos;s your craft, your customers, or your family — Zander gives you the freedom to be where you&apos;re most valuable, while the business takes care of itself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXECUTIVES */}
      <section id="demo" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <span className="fade-up" style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#00CFEB',
            marginBottom: '0.85rem',
            display: 'block',
          }}>Your AI C-Suite</span>
          <h2 className="fade-up" style={{
            fontFamily: "'Sora', var(--font-sora), sans-serif",
            fontSize: 'clamp(1.9rem, 4vw, 2.85rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.18,
            marginBottom: '1rem',
          }}>Seven Executives. One Platform.</h2>
          <p className="fade-up" style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.58)',
            maxWidth: '520px',
            lineHeight: 1.75,
            margin: '0 auto',
          }}>
            Each executive is purpose-built for their role — trained on your business, always available, never off the clock.
          </p>

          {/* Row 1: 4 executives */}
          <div className="exec-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.1rem',
            marginTop: '3.5rem',
          }}>
            {[
              { letter: 'J', name: 'Jordan', role: 'CRO', title: 'Sales & Revenue', desc: 'Manages your pipeline, follows up on every lead, and closes more deals so you stop leaving money on the table.' },
              { letter: 'B', name: 'Ben', role: 'CFO', title: 'Finance & Accounting', desc: 'Tracks every dollar, monitors cash flow, and gives you the financial clarity to make confident decisions.', delay: '0.05s' },
              { letter: 'M', name: 'Miranda', role: 'COO', title: 'Operations', desc: 'Keeps your operations tight, your team coordinated, and your business running efficiently without constant oversight.', delay: '0.1s' },
              { letter: 'D', name: 'Don', role: 'CMO', title: 'Marketing & Growth', desc: 'Builds your brand, runs your campaigns, and keeps you visible to the customers who need what you do.', delay: '0.15s' },
            ].map((exec, i) => (
              <div key={i} className="fade-up" style={{
                background: '#0E1017',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '1.75rem',
                textAlign: 'left',
                transitionDelay: exec.delay || '0s',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(0,207,235,0.38)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Sora', var(--font-sora), sans-serif",
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#00CFEB',
                  marginBottom: '1.2rem',
                  background: 'rgba(0,207,235,0.05)',
                  position: 'relative',
                }}>
                  {exec.letter}
                  <span style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '8px',
                    height: '8px',
                    background: '#00CFEB',
                    borderRadius: '50%',
                    border: '2px solid #0E1017',
                  }} />
                </div>
                <h4 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '0.97rem', fontWeight: 700, marginBottom: '0.28rem' }}>
                  {exec.name} — {exec.role}
                </h4>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#00CFEB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.6rem',
                }}>{exec.title}</div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.6 }}>{exec.desc}</p>
              </div>
            ))}
          </div>

          {/* Row 2: 3 executives */}
          <div className="exec-row-2" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.1rem',
            maxWidth: '900px',
            margin: '1.1rem auto 0',
          }}>
            {[
              { letter: 'T', name: 'Ted', role: 'CPO', title: 'People & HR', desc: 'Manages hiring, team development, and the culture that makes people want to stay and grow with you.', delay: '0.2s' },
              { letter: 'J', name: 'Jarvis', role: 'CIO', title: 'Technology & Security', desc: 'Oversees your tech stack, data security, and digital operations so you never have to think about it.', delay: '0.25s' },
              { letter: 'P', name: 'Pam', role: 'EA', title: 'Executive Assistant', desc: 'Manages your calendar, coordinates your team, and makes sure nothing important slips past you.', delay: '0.3s' },
            ].map((exec, i) => (
              <div key={i} className="fade-up" style={{
                background: '#0E1017',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '1.75rem',
                textAlign: 'left',
                transitionDelay: exec.delay,
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(0,207,235,0.38)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Sora', var(--font-sora), sans-serif",
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#00CFEB',
                  marginBottom: '1.2rem',
                  background: 'rgba(0,207,235,0.05)',
                  position: 'relative',
                }}>
                  {exec.letter}
                  <span style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '8px',
                    height: '8px',
                    background: '#00CFEB',
                    borderRadius: '50%',
                    border: '2px solid #0E1017',
                  }} />
                </div>
                <h4 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '0.97rem', fontWeight: 700, marginBottom: '0.28rem' }}>
                  {exec.name} — {exec.role}
                </h4>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#00CFEB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.6rem',
                }}>{exec.title}</div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.6 }}>{exec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <span className="fade-up" style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#00CFEB',
            marginBottom: '0.85rem',
            display: 'block',
          }}>Trusted by Business Owners</span>
          <h2 className="fade-up" style={{
            fontFamily: "'Sora', var(--font-sora), sans-serif",
            fontSize: 'clamp(1.9rem, 4vw, 2.85rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.18,
            marginBottom: '1rem',
          }}>Reclaiming Passion, One Founder at a Time</h2>

          <div className="testi-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginTop: '3.5rem',
          }}>
            {[
              {
                quote: '"I was drowning in spreadsheets and paying $1,500/month for software that didn\'t talk to each other. Zander gave me my life back. I\'m working IN my business again, not just ON the paperwork."',
                initials: 'JW',
                name: 'Jonathan White',
                company: 'My Cabinet Factory — 32 years in business',
              },
              {
                quote: '"As a contractor managing 6 crews, I needed everything in one place. Zander\'s COO handles scheduling, the CFO tracks job costs, and I finally have real visibility into my business. Game changer."',
                initials: 'MB',
                name: 'Mike Bradford',
                company: 'ProBuild Contractors',
                delay: '0.1s',
              },
              {
                quote: '"The AI reminded me about a deal I\'d forgotten, drafted the follow-up email, and we closed it two days later. $45K deal I would have lost. I don\'t know how I ran this business without it."',
                initials: 'SE',
                name: 'Sarah Evans',
                company: 'Elite HVAC Solutions',
                delay: '0.2s',
              },
            ].map((t, i) => (
              <div key={i} className="fade-up" style={{
                background: '#0E1017',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: '3px solid rgba(0,207,235,0.4)',
                borderRadius: '0 14px 14px 0',
                padding: '2rem',
                transitionDelay: t.delay || '0s',
              }}>
                <p style={{
                  fontSize: '0.97rem',
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.78,
                  marginBottom: '1.5rem',
                  fontStyle: 'italic',
                }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(0,207,235,0.15)',
                    border: '1px solid rgba(0,207,235,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Sora', var(--font-sora), sans-serif",
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#00CFEB',
                    flexShrink: 0,
                  }}>{t.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3 }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.58)' }}>{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, rgba(0,207,235,0.035) 0%, transparent 60%)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="fade-up waitlist-inner" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '4rem',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#13151E',
              border: '1px solid rgba(0,207,235,0.28)',
              color: 'rgba(255,255,255,0.7)',
              padding: '0.38rem 1rem',
              borderRadius: '50px',
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              marginBottom: '1.25rem',
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#22C55E',
                boxShadow: '0 0 8px #22C55E',
              }} />
              Limited — Founding 50 Only
            </div>
            <h2 style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontSize: 'clamp(1.7rem, 3vw, 2.3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}>
              Not ready to commit?<br/>Reserve your spot for $49.
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.58)',
              lineHeight: 1.8,
              marginBottom: '1.5rem',
              maxWidth: '520px',
            }}>
              Put down a fully refundable $49 deposit to hold your place in the Founding 50 — and lock in your founding rate before spots fill. When you&apos;re ready to activate, your deposit applies to your first month. No obligation. Cancel anytime.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0, margin: 0 }}>
              {[
                'Your founding rate locked the moment you deposit',
                '$49 fully refundable — anytime before activation',
                '$49 credited to your first month when you go live',
                'Behind-the-scenes updates during beta',
                'Direct input on roadmap & features',
              ].map((perk, i) => (
                <li key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.82)',
                  lineHeight: 1.45,
                }}>
                  <span style={{
                    width: '18px',
                    height: '18px',
                    background: 'rgba(0,207,235,0.13)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                    color: '#00CFEB',
                  }}><CheckIcon /></span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
          <div style={{
            background: '#0E1017',
            border: '1px solid rgba(0,207,235,0.3)',
            borderRadius: '18px',
            padding: '2.5rem',
            boxShadow: '0 0 40px rgba(0,207,235,0.06)',
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '50px',
                overflow: 'hidden',
                marginBottom: '0.6rem',
              }}>
                <div style={{ height: '100%', background: '#00CFEB', borderRadius: '50px', width: '46%' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.58)' }}>27 of 50 founding spots claimed</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{
                fontFamily: "'Sora', var(--font-sora), sans-serif",
                fontSize: '3.5rem',
                fontWeight: 800,
                lineHeight: 1,
                color: '#00CFEB',
              }}>$49</span>
              <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.4 }}>fully refundable deposit</span>
            </div>
            <a href="/waitlist" style={{
              display: 'block',
              width: '100%',
              background: '#00CFEB',
              color: '#000',
              padding: '0.9rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.97rem',
              textAlign: 'center',
              textDecoration: 'none',
              marginBottom: '0.85rem',
              boxSizing: 'border-box',
            }}>Reserve My Founding Spot</a>
            <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', letterSpacing: '0.03em' }}>
              100% refundable &bull; Applied to first month &bull; No obligation
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <span className="fade-up" style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#00CFEB',
            marginBottom: '0.85rem',
            display: 'block',
          }}>Simple, Transparent Pricing</span>
          <h2 className="fade-up" style={{
            fontFamily: "'Sora', var(--font-sora), sans-serif",
            fontSize: 'clamp(1.9rem, 4vw, 2.85rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.18,
            marginBottom: '0.5rem',
          }}>Founding 50 Rates — Locked for Life</h2>
          <p className="fade-up" style={{
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.58)',
            marginBottom: '3.5rem',
          }}>
            Public pricing launches higher after beta. These rates never increase for founding members.
          </p>

          <div className="pricing-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.1rem',
            textAlign: 'left',
          }}>
            {/* STARTER */}
            <div className="fade-up" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2.25rem',
              position: 'relative',
            }}>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.28rem' }}>Starter</h3>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.58)', marginBottom: '1.5rem' }}>Solo operators & small teams</p>
              <div style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '2.9rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem' }}>
                $199<span style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.58)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#00CFEB', opacity: 0.65, textDecoration: 'line-through', marginBottom: '0.2rem' }}>Public price: $299/mo</p>
              <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.58)', marginBottom: '1.75rem' }}>Founding rate — locked for life</p>
              <a href="/signup" style={{
                display: 'block',
                width: '100%',
                padding: '0.78rem',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '1.75rem',
                background: 'transparent',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.18)',
                boxSizing: 'border-box',
              }}>Start Free Trial</a>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', marginTop: '1.2rem', marginBottom: '0.6rem' }}>Executives included</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.72rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
                  <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', color: '#00CFEB' }}><CheckIcon /></span>
                  <span><strong>Jordan (CRO)</strong> — Sales pipeline & follow-ups</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
                  <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', color: '#00CFEB' }}><CheckIcon /></span>
                  <span><strong>Pam (EA)</strong> — Calendar, tasks & reminders</span>
                </li>
              </ul>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', marginTop: '1.2rem', marginBottom: '0.6rem' }}>Platform</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.72rem', padding: 0, margin: 0 }}>
                {['Up to 3 users', 'Email & SMS automation', 'AI Chat Support', 'Basic analytics', 'Email support'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
                    <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', color: '#00CFEB' }}><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* PRO (featured) */}
            <div className="fade-up" style={{
              background: '#13151E',
              border: '1px solid #00CFEB',
              borderRadius: '16px',
              padding: '2.25rem',
              position: 'relative',
              transitionDelay: '0.08s',
            }}>
              <div style={{
                position: 'absolute',
                top: '-13px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#00CFEB',
                color: '#000',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '0.28rem 0.9rem',
                borderRadius: '50px',
                whiteSpace: 'nowrap',
              }}>Most Popular</div>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.28rem' }}>Pro</h3>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.58)', marginBottom: '1.5rem' }}>Growing businesses ready to scale</p>
              <div style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '2.9rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem' }}>
                $349<span style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.58)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#00CFEB', opacity: 0.65, textDecoration: 'line-through', marginBottom: '0.2rem' }}>Public price: $499/mo</p>
              <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.58)', marginBottom: '1.75rem' }}>Founding rate — locked for life</p>
              <a href="/signup" style={{
                display: 'block',
                width: '100%',
                padding: '0.78rem',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '1.75rem',
                background: '#00CFEB',
                color: '#000',
                border: 'none',
                boxSizing: 'border-box',
              }}>Get Early Access</a>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', marginTop: '1.2rem', marginBottom: '0.6rem' }}>Everything in Starter, plus</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.72rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
                  <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', color: '#00CFEB' }}><CheckIcon /></span>
                  <span><strong>Don (CMO)</strong> — Marketing engine & brand</span>
                </li>
              </ul>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', marginTop: '1.2rem', marginBottom: '0.6rem' }}>Platform</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.72rem', padding: 0, margin: 0 }}>
                {['Up to 10 users', 'Advanced analytics & reporting', 'Campaign management tools', 'Priority support', 'Onboarding call included'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
                    <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', color: '#00CFEB' }}><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* BUSINESS */}
            <div className="fade-up" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2.25rem',
              position: 'relative',
              transitionDelay: '0.16s',
            }}>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.28rem' }}>Business</h3>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.58)', marginBottom: '1.5rem' }}>Full team, all executives included</p>
              <div style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '2.9rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem' }}>
                $599<span style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.58)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#00CFEB', opacity: 0.65, textDecoration: 'line-through', marginBottom: '0.2rem' }}>Public price: $799/mo</p>
              <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.58)', marginBottom: '1.75rem' }}>Founding rate — locked for life</p>
              <a href="/signup" style={{
                display: 'block',
                width: '100%',
                padding: '0.78rem',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '1.75rem',
                background: 'transparent',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.18)',
                boxSizing: 'border-box',
              }}>Get Early Access</a>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', marginTop: '1.2rem', marginBottom: '0.6rem' }}>Everything in Pro, plus</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.72rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
                  <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', color: '#00CFEB' }}><CheckIcon /></span>
                  <span><strong>Every new executive auto-included</strong> as they launch — CFO, COO, CPO, CIO — no upgrade required</span>
                </li>
              </ul>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', marginTop: '1.2rem', marginBottom: '0.6rem' }}>Platform</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.72rem', padding: 0, margin: 0 }}>
                {['Up to 25 users', 'Custom integrations', 'Dedicated success manager', 'White-glove onboarding'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
                    <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', color: '#00CFEB' }}><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* ENTERPRISE */}
            <div className="fade-up" style={{
              background: 'linear-gradient(135deg, #0E1017 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2.25rem',
              position: 'relative',
              transitionDelay: '0.24s',
            }}>
              <h3 style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.28rem' }}>Enterprise</h3>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.58)', marginBottom: '1.5rem' }}>Multi-location, white-label & complex orgs</p>
              <div style={{ fontFamily: "'Sora', var(--font-sora), sans-serif", fontSize: '2.4rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem' }}>
                Custom
              </div>
              <p style={{ fontSize: '0.75rem', color: '#00CFEB', opacity: 0.65, textDecoration: 'line-through', marginBottom: '0.2rem' }}>Starting at $999/mo</p>
              <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.58)', marginBottom: '1.75rem' }}>&nbsp;</p>
              <a href="mailto:hello@zanderos.com" style={{
                display: 'block',
                width: '100%',
                padding: '0.78rem',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '0.92rem',
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '1.75rem',
                background: 'transparent',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.18)',
                boxSizing: 'border-box',
              }}>Contact Sales</a>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', marginTop: '1.2rem', marginBottom: '0.6rem' }}>Everything in Business, plus</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.72rem', padding: 0, margin: 0 }}>
                {[
                  'Unlimited users',
                  'White-label platform (your branding)',
                  'Custom API access & integrations',
                  'Multi-entity & multi-location',
                  'SLA guarantees',
                  'Direct founder access during onboarding',
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
                    <span style={{ width: '18px', height: '18px', background: 'rgba(0,207,235,0.13)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', color: '#00CFEB' }}><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section id="about" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="founder-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.1fr',
            gap: '5rem',
            alignItems: 'center',
          }}>
            <div className="fade-up founder-logo-wrap" style={{
              background: '#0E1017',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 50% 50%, rgba(0,207,235,0.07) 0%, transparent 70%)',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <CompassLogoLarge />
              </div>
            </div>

            <div className="fade-up" style={{ transitionDelay: '0.15s' }}>
              <h2 style={{
                fontFamily: "'Sora', var(--font-sora), sans-serif",
                fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '1.5rem',
                lineHeight: 1.18,
              }}>Freedom for Founders.</h2>
              <p style={{ fontSize: '0.97rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.82, marginBottom: '1.4rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>For 32 years, I ran a manufacturing company.</span> I loved the work — the craft, the customers, watching a product go from design to delivery. But somewhere in year five, the business started running me.
              </p>
              <p style={{ fontSize: '0.97rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.82, marginBottom: '1.4rem' }}>
                I was spending my days on things I wasn&apos;t hired to do — chasing receivables, managing spreadsheets, trying to remember which leads I&apos;d left hanging. The thing I actually built the company for kept getting pushed aside.
              </p>
              <p style={{ fontSize: '0.97rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.82, marginBottom: '1.4rem' }}>
                I built Zander because <span style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>every business owner deserves the executive help to keep their business organized and moving forward</span> — so they can step back into the priorities, the craft, and the life they built their business to support.
              </p>
              <p style={{ fontSize: '0.97rem', color: 'rgba(255,255,255,0.58)', lineHeight: 1.82, marginBottom: 0 }}>
                You shouldn&apos;t have to choose between running a great business and living a great life. Zander makes sure you don&apos;t have to.
              </p>

              <div style={{
                marginTop: '2rem',
                paddingTop: '1.75rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(0,207,235,0.12)',
                  border: '1px solid rgba(0,207,235,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Sora', var(--font-sora), sans-serif",
                  fontWeight: 700,
                  color: '#00CFEB',
                  fontSize: '1rem',
                  flexShrink: 0,
                }}>JW</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', lineHeight: 1.3 }}>Jonathan White</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.58)' }}>Founder, Zander Technologies &bull; Owner, My Cabinet Factory (32 years)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
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
        <div className="fade-up" style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Sora', var(--font-sora), sans-serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            Your business is ready.<br/><span style={{ color: '#00CFEB' }}>Are you?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '1rem', marginBottom: '2.25rem', lineHeight: 1.75 }}>
            Join the Founding 50 and get expert-level executive support locked in for life — before we open to the public and pricing goes up.
          </p>
          <a href="/signup" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#00CFEB',
            color: '#000',
            padding: '1rem 2.5rem',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
          }}>
            Get Early Access — from $199/mo
          </a>
          <p style={{ fontSize: '0.79rem', color: 'rgba(255,255,255,0.3)', marginTop: '1rem', letterSpacing: '0.04em' }}>
            Only 50 founding spots &bull; No credit card required &bull; Cancel anytime
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '2.5rem 2rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <CompassLogo size={28} />
            <span style={{
              fontFamily: "'Sora', var(--font-sora), sans-serif",
              fontWeight: 700,
              fontSize: '0.97rem',
              color: '#FFFFFF',
              letterSpacing: '0.08em',
            }}>ZANDER</span>
          </a>
          <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
            <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none', fontSize: '0.83rem' }}>Product</a>
            <a href="#pricing" style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none', fontSize: '0.83rem' }}>Pricing</a>
            <a href="#about" style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none', fontSize: '0.83rem' }}>About</a>
            <a href="/login" style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none', fontSize: '0.83rem' }}>Sign In</a>
            <a href="/legal/privacy" style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none', fontSize: '0.83rem' }}>Privacy</a>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.22)' }}>&copy; 2026 Zander Technologies LLC</p>
        </div>
      </footer>
    </div>
  );
}
