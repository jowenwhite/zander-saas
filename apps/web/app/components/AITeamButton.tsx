'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

interface Executive {
  id: string;
  name: string;
  initial: string;
  role: string;
  fullTitle: string;
  color: string;
  status: 'active' | 'coming_soon';
  intro: string;
}

const executives: Executive[] = [
  {
    id: 'ea',
    name: 'Pam',
    initial: 'P',
    role: 'EA',
    fullTitle: 'Executive Assistant',
    color: '#C2185B',
    status: 'active',
    intro: "I'm Pam. I keep your schedule straight, your inbox under control, and your follow-ups from falling through the cracks. You focus on the work — I'll make sure nothing gets missed. Come see what organized actually feels like.",
  },
  {
    id: 'cro',
    name: 'Jordan',
    initial: 'J',
    role: 'CRO',
    fullTitle: 'Chief Revenue Officer',
    color: '#BF0A30',
    status: 'active',
    intro: "I'm Jordan. I manage your pipeline, track every deal, and make sure no lead goes cold. If there's revenue on the table, I'm on it. Let's get your sales process running the way it should.",
  },
  {
    id: 'cmo',
    name: 'Don',
    initial: 'D',
    role: 'CMO',
    fullTitle: 'Chief Marketing Officer',
    color: '#F57C00',
    status: 'active',
    intro: "I'm Don. I handle your campaigns, your content calendar, and your brand strategy. Marketing shouldn't be the thing you get to 'when you have time.' I'll make sure it's always moving. Let's build something people notice.",
  },
  {
    id: 'cfo',
    name: 'Ben',
    initial: 'B',
    role: 'CFO',
    fullTitle: 'Chief Financial Officer',
    color: '#2E7D32',
    status: 'coming_soon',
    intro: '',
  },
  {
    id: 'coo',
    name: 'Miranda',
    initial: 'M',
    role: 'COO',
    fullTitle: 'Chief Operations Officer',
    color: '#5E35B1',
    status: 'coming_soon',
    intro: '',
  },
  {
    id: 'cpo',
    name: 'Ted',
    initial: 'T',
    role: 'CPO',
    fullTitle: 'Chief People Officer',
    color: '#0288D1',
    status: 'coming_soon',
    intro: '',
  },
];

export default function AITeamButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExec, setSelectedExec] = useState<Executive>(executives[0]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#00CFEB',
          color: '#000',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,207,235,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Meet Your Team"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </button>

      {/* Slide-out Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? '0' : '-420px',
          width: '400px',
          height: '100vh',
          background: '#0E1017',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          zIndex: 10000,
          transition: 'right 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '-8px 0 30px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '18px', fontWeight: 700 }}>Your Executive Team</h3>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Meet the team behind Zander</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar Row */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {executives.map((exec) => (
            <button
              key={exec.id}
              onClick={() => setSelectedExec(exec)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: exec.status === 'active' ? exec.color : '#333',
                color: 'white',
                border: selectedExec.id === exec.id ? '3px solid #00CFEB' : '3px solid transparent',
                cursor: exec.status === 'active' ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: "'Sora', 'Inter', sans-serif",
                opacity: exec.status === 'coming_soon' ? 0.4 : 1,
                transition: 'border-color 0.2s ease',
                padding: 0,
                flexDirection: 'column',
                lineHeight: 1,
              }}
            >
              {exec.initial}
            </button>
          ))}
        </div>

        {/* Executive Info Card */}
        <div style={{
          flex: 1,
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Large Avatar */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: selectedExec.status === 'active' ? selectedExec.color : '#333',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 700,
            fontFamily: "'Sora', 'Inter', sans-serif",
            marginBottom: '16px',
            opacity: selectedExec.status === 'coming_soon' ? 0.4 : 1,
          }}>
            {selectedExec.initial}
          </div>

          {/* Name & Title */}
          <h4 style={{
            margin: 0,
            color: '#FFFFFF',
            fontSize: '22px',
            fontWeight: 700,
            fontFamily: "'Sora', 'Inter', sans-serif",
          }}>
            {selectedExec.name}
          </h4>
          <p style={{
            margin: '4px 0 0',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px',
          }}>
            {selectedExec.fullTitle}
          </p>

          {/* Intro or Coming Soon */}
          {selectedExec.status === 'active' ? (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              width: '100%',
            }}>
              <p style={{
                margin: 0,
                color: 'rgba(255,255,255,0.8)',
                fontSize: '15px',
                lineHeight: 1.7,
                fontStyle: 'italic',
              }}>
                &ldquo;{selectedExec.intro}&rdquo;
              </p>
            </div>
          ) : (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '12px',
              width: '100%',
              textAlign: 'center',
            }}>
              <p style={{
                margin: 0,
                color: 'rgba(255,255,255,0.4)',
                fontSize: '14px',
              }}>
                {selectedExec.name} is coming soon.
              </p>
              <p style={{
                margin: '8px 0 0',
                color: 'rgba(255,255,255,0.3)',
                fontSize: '13px',
              }}>
                Founding members get every new executive included at no additional cost.
              </p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <a
            href="/signup"
            style={{
              display: 'block',
              width: '100%',
              padding: '14px',
              background: '#00CFEB',
              color: '#000',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '16px',
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            Get Early Access
          </a>
          <p style={{
            margin: '8px 0 0',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '12px',
            textAlign: 'center',
          }}>
            Founding 50 spots — rate locked for life
          </p>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 9998,
          }}
        />
      )}
    </>
  );
}
