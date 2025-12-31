'use client';

import { useState, useEffect } from 'react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  userName: string;
  companyName: string;
}

const FOCUS_AREAS = [
  { id: 'leads_slipping', label: 'Leads and deals are slipping through cracks', icon: '🎯' },
  { id: 'pipeline_visibility', label: "I can't see my pipeline or revenue clearly", icon: '📊' },
  { id: 'communication_scattered', label: 'Follow-ups and communication are scattered', icon: '📧' },
  { id: 'team_processes', label: 'My team needs consistent processes', icon: '👥' },
  { id: 'need_structure', label: 'Everything feels chaotic - I need structure', icon: '🏗️' },
];

const PILLARS = [
  { id: 'people', name: 'People', icon: '👥', description: 'Everyone in your business ecosystem' },
  { id: 'projects', name: 'Projects', icon: '📋', description: 'How you deliver value' },
  { id: 'products', name: 'Products', icon: '📦', description: 'What you sell or deliver' },
  { id: 'process', name: 'Process', icon: '⚙️', description: 'How work gets done' },
  { id: 'production', name: 'Production', icon: '📊', description: 'The daily reality' },
];

export default function OnboardingWizard({ isOpen, onComplete, userName, companyName }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [focusArea, setFocusArea] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalSteps = 7;

  const nextStep = async () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(prev => Math.min(prev + 1, totalSteps));
      setIsAnimating(false);
    }, 300);
  };

  const handleFocusSelect = (id: string) => {
    setFocusArea(id);
    // Save to API
    fetch(process.env.NEXT_PUBLIC_API_URL + '/users/onboarding/focus-area', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('zander_token'),
      },
      body: JSON.stringify({ focusArea: id }),
    });
  };

  const handleComplete = async () => {
    await fetch(process.env.NEXT_PUBLIC_API_URL + '/users/onboarding/complete', { 
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('zander_token') },
    });
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(12, 35, 64, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '2rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        opacity: isAnimating ? 0.5 : 1,
        transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.3s ease',
      }}>
        {/* Progress Bar */}
        <div style={{
          height: '4px',
          background: '#E5E7EB',
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(step / totalSteps) * 100}%`,
            background: 'linear-gradient(90deg, #BF0A30, #F0B323)',
            transition: 'width 0.5s ease',
          }} />
        </div>

        <div style={{ padding: '3rem' }}>
          {/* Step 1: Philosophy Hook */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👋</div>
              <h1 style={{ fontSize: '2rem', color: '#0C2340', marginBottom: '1rem' }}>
                Welcome to Zander, {userName}.
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#0C2340', marginBottom: '1.5rem' }}>
                I'm <strong style={{ color: '#BF0A30' }}>Jordan</strong>, your Chief Revenue Officer.
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #F8F9FA, #EAE6DB)',
                borderLeft: '4px solid #BF0A30',
                padding: '1.5rem',
                borderRadius: '0 8px 8px 0',
                marginBottom: '2rem',
                textAlign: 'left',
              }}>
                <p style={{ fontStyle: 'italic', color: '#0C2340', fontSize: '1.1rem', lineHeight: '1.7' }}>
                  "Every successful business - from a food truck to a Fortune 500 - operates through the same five elements. 
                  <strong> Complexity isn't sophistication. Simplicity is.</strong>"
                </p>
              </div>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                Zander is built on this principle. Let me show you what I mean.
              </p>
              <button onClick={nextStep} style={{
                background: 'linear-gradient(135deg, #BF0A30, #A00A28)',
                color: 'white',
                border: 'none',
                padding: '1rem 3rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}>
                Show Me →
              </button>
            </div>
          )}

          {/* Step 2: Five Pillars */}
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#0C2340', marginBottom: '0.5rem' }}>
                The Five Pillars of Every Business
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                You already have all five. They're just scattered everywhere.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
              }}>
                {PILLARS.map((pillar) => (
                  <div key={pillar.id} style={{
                    background: '#0C2340',
                    color: 'white',
                    padding: '1.5rem 1rem',
                    borderRadius: '12px',
                    width: '110px',
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{pillar.icon}</div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{pillar.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{pillar.description}</div>
                  </div>
                ))}
              </div>
              <div style={{
                background: '#F8F9FA',
                padding: '1rem 1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem',
              }}>
                <p style={{ color: '#0C2340', margin: 0 }}>
                  <strong>Zander brings them together</strong> so you can finally see your whole business clearly.
                </p>
              </div>
              <button onClick={nextStep} style={{
                background: 'linear-gradient(135deg, #BF0A30, #A00A28)',
                color: 'white',
                border: 'none',
                padding: '1rem 3rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}>
                I'm Ready →
              </button>
            </div>
          )}

          {/* Step 3: Pain Point Selection */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#0C2340', marginBottom: '0.5rem', textAlign: 'center' }}>
                Where should we start?
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem', textAlign: 'center' }}>
                What's causing the most friction in <strong>{companyName}</strong> today?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleFocusSelect(area.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.5rem',
                      border: focusArea === area.id ? '2px solid #BF0A30' : '2px solid #E5E7EB',
                      borderRadius: '8px',
                      background: focusArea === area.id ? 'rgba(191, 10, 48, 0.05)' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{area.icon}</span>
                    <span style={{ color: '#0C2340', fontWeight: focusArea === area.id ? '600' : '400' }}>
                      {area.label}
                    </span>
                    {focusArea === area.id && (
                      <span style={{ marginLeft: 'auto', color: '#BF0A30', fontWeight: 'bold' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', marginBottom: '1.5rem' }}>
                (Don't worry - we'll address all of these. But let's start with your biggest win.)
              </p>
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={nextStep} 
                  disabled={!focusArea}
                  style={{
                    background: focusArea ? 'linear-gradient(135deg, #BF0A30, #A00A28)' : '#E5E7EB',
                    color: focusArea ? 'white' : '#888',
                    border: 'none',
                    padding: '1rem 3rem',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: focusArea ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Quick Win Preview */}
          {step === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h2 style={{ fontSize: '1.8rem', color: '#0C2340', marginBottom: '1rem' }}>
                Your First Win
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
                Based on what you told me, let's start with your <strong style={{ color: '#BF0A30' }}>Pipeline</strong>.
              </p>
              <div style={{
                background: '#0C2340',
                color: 'white',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                textAlign: 'left',
              }}>
                <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
                  <strong style={{ color: '#F0B323' }}>Jordan:</strong> "This is where every opportunity lives. 
                  No more sticky notes. No more forgotten follow-ups."
                </p>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  Drag deals between stages. That's it. Simple.
                </p>
              </div>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                In 30 days, you'll wonder how you ever ran your business without this view.
              </p>
              <button onClick={nextStep} style={{
                background: 'linear-gradient(135deg, #BF0A30, #A00A28)',
                color: 'white',
                border: 'none',
                padding: '1rem 3rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}>
                Show Me the Layout →
              </button>
            </div>
          )}

          {/* Step 5: Geography */}
          {step === 5 && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#0C2340', marginBottom: '1.5rem', textAlign: 'center' }}>
                Your Zander Layout
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: '1rem',
                marginBottom: '2rem',
                background: '#F8F9FA',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '2px solid #E5E7EB',
              }}>
                <div style={{
                  background: '#0C2340',
                  borderRadius: '8px',
                  padding: '1rem',
                  color: 'white',
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '1rem', color: '#F0B323' }}>SIDEBAR</div>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.8' }}>
                    <div>📊 Production</div>
                    <div>🎯 CRO</div>
                    <div>📅 Schedule</div>
                    <div>📁 Treasury</div>
                    <div>👥 People</div>
                  </div>
                </div>
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  border: '1px solid #E5E7EB',
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#0C2340' }}>MAIN WORKSPACE</div>
                  <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
                    Changes based on what you're working on. Click any sidebar item to switch views.
                  </p>
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(191, 10, 48, 0.05)',
                    borderRadius: '6px',
                    borderLeft: '3px solid #BF0A30',
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#0C2340' }}>
                      💬 <strong>Ask Jordan</strong> - bottom right, always available
                    </p>
                  </div>
                </div>
              </div>
              <p style={{ color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>
                <strong>Simple.</strong> Everything one click away. Always.
              </p>
              <div style={{ textAlign: 'center' }}>
                <button onClick={nextStep} style={{
                  background: 'linear-gradient(135deg, #BF0A30, #A00A28)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 3rem',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}>
                  Got It →
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Getting Started Checklist */}
          {step === 6 && (
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#0C2340', marginBottom: '0.5rem', textAlign: 'center' }}>
                Your Path to Operating Simply
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem', textAlign: 'center' }}>
                Do these at your pace. Each one unlocks more power.
              </p>
              <div style={{
                background: '#F8F9FA',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}>
                {[
                  { label: 'Welcome to Zander', done: true, time: '' },
                  { label: 'Understand the Five Pillars', done: true, time: '' },
                  { label: 'Connect your email', done: false, time: '5 min' },
                  { label: 'Add your first contact', done: false, time: '2 min' },
                  { label: 'Create your first deal', done: false, time: '3 min' },
                  { label: 'Explore The Treasury', done: false, time: '5 min' },
                  { label: 'Customize your dashboard', done: false, time: '3 min' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: i < 6 ? '1px solid #E5E7EB' : 'none',
                  }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      fontSize: '0.9rem',
                      background: item.done ? '#28a745' : '#E5E7EB',
                      color: item.done ? 'white' : '#888',
                    }}>
                      {item.done ? '✓' : '○'}
                    </span>
                    <span style={{ 
                      flex: 1, 
                      color: item.done ? '#28a745' : '#0C2340',
                      textDecoration: item.done ? 'line-through' : 'none',
                    }}>
                      {item.label}
                    </span>
                    {item.time && (
                      <span style={{ color: '#888', fontSize: '0.85rem' }}>{item.time}</span>
                    )}
                  </div>
                ))}
              </div>
              <p style={{ color: '#666', textAlign: 'center', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                This checklist stays in your sidebar until you're set up. No rush.
              </p>
              <div style={{ textAlign: 'center' }}>
                <button onClick={nextStep} style={{
                  background: 'linear-gradient(135deg, #BF0A30, #A00A28)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 3rem',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}>
                  Almost There →
                </button>
              </div>
            </div>
          )}

          {/* Step 7: AI Seed + Complete */}
          {step === 7 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h2 style={{ fontSize: '1.8rem', color: '#0C2340', marginBottom: '1rem' }}>
                One More Thing...
              </h2>
              <div style={{
                background: '#0C2340',
                color: 'white',
                padding: '2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                textAlign: 'left',
              }}>
                <p style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#F0B323' }}>Jordan:</strong> "I'm not just a guide. I'm your CRO."
                </p>
                <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
                  Once you're settled in, I can:
                </p>
                <ul style={{ margin: '0 0 1rem 1.5rem', opacity: 0.9, lineHeight: '1.8' }}>
                  <li>Draft follow-up emails in seconds</li>
                  <li>Analyze your pipeline for risks</li>
                  <li>Suggest your next best action</li>
                  <li>Answer any question about Zander</li>
                </ul>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  And I'm just <strong>one of seven AI executives</strong> ready to help you run {companyName}.
                </p>
              </div>
              <p style={{ color: '#666', marginBottom: '2rem' }}>
                But first - let's get you comfortable. I'll be right here when you're ready.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '2rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(191, 10, 48, 0.1)',
                borderRadius: '8px',
              }}>
                <span>💬</span>
                <span style={{ color: '#0C2340', fontWeight: '600' }}>Ask Jordan</span>
                <span style={{ color: '#666' }}>- bottom right</span>
              </div>
              <div>
                <button onClick={handleComplete} style={{
                  background: 'linear-gradient(135deg, #28a745, #20c843)',
                  color: 'white',
                  border: 'none',
                  padding: '1.25rem 4rem',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                }}>
                  Start Using Zander →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}