'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

interface SignatureData {
  name: string;
  title: string;
  date: string;
  agreed: boolean;
  ip: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  hours: number;
  description: string;
  deliverables: string[];
  timeline: string;
  paymentTerms: string;
}

interface CSAFormData {
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientEmail: string;
  effectiveDate: string;
  selectedPackage: string;
  zanderSignature: SignatureData;
  clientSignature: SignatureData;
  documentId: string;
  status: 'draft' | 'pending' | 'signed';
  createdAt: string;
}

const PACKAGES: Package[] = [
  {
    id: 'business-analysis',
    name: 'Business Analysis',
    price: 500,
    hours: 3,
    description: 'Comprehensive business assessment and strategic recommendations.',
    deliverables: [
      'Operating Simply Scorecard baseline assessment',
      'Written business analysis report',
      'Strategic recommendations document',
      'Priority identification summary',
    ],
    timeline: '1-2 weeks from engagement start',
    paymentTerms: 'Full payment due before engagement begins.',
  },
  {
    id: 'compass',
    name: 'Compass',
    price: 2500,
    hours: 10,
    description: 'Strategic direction setting and 90-day action planning.',
    deliverables: [
      'Operating Simply Scorecard assessment',
      'Strategic direction document',
      'Priority matrix and identification',
      '90-day action plan with milestones',
      'Follow-up review session',
    ],
    timeline: '4-6 weeks from engagement start',
    paymentTerms: 'Full payment due before engagement begins.',
  },
  {
    id: 'foundation',
    name: 'Foundation',
    price: 4500,
    hours: 20,
    description: 'Full operational foundation build with comprehensive documentation.',
    deliverables: [
      'Operating Simply Scorecard assessment',
      'Complete business model canvas',
      'Standard Operating Procedures (SOPs) documentation',
      'Process workflow documentation',
      'Team alignment and role clarity frameworks',
      'Implementation roadmap',
      'Weekly check-in sessions',
      'Final review and handoff',
    ],
    timeline: '8-12 weeks from engagement start',
    paymentTerms: '50% deposit secures engagement. Balance due before second session.',
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    price: 8000,
    hours: 40,
    description: 'Complete business transformation with ongoing strategic partnership.',
    deliverables: [
      'All Foundation package deliverables',
      'Comprehensive strategic planning',
      'Advanced process optimization',
      'Team development and training programs',
      'Financial systems and reporting frameworks',
      'Marketing and growth strategy documentation',
      'Technology and tools implementation guidance',
      'Ongoing strategic partnership sessions',
      'Quarterly business reviews',
    ],
    timeline: '12-16 weeks from engagement start',
    paymentTerms: '50% deposit secures engagement. Balance due before second session.',
  },
];

const ZANDER_INFO = {
  company: 'Zander Systems LLC',
  representative: 'Jonathan White',
  title: 'Managing Member',
  address: 'Marietta, Georgia',
  email: 'jonathan@zanderos.com',
};

export default function CSAPage() {
  const params = useParams();
  const documentId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CSAFormData>({
    clientName: '',
    clientCompany: '',
    clientAddress: '',
    clientEmail: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    selectedPackage: '',
    zanderSignature: { name: '', title: '', date: '', agreed: false, ip: '' },
    clientSignature: { name: '', title: '', date: '', agreed: false, ip: '' },
    documentId: documentId || `CSA-${Date.now()}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
  });

  const [userIP, setUserIP] = useState<string>('');
  const [isSigned, setIsSigned] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const selectedPackage = PACKAGES.find(p => p.id === formData.selectedPackage);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIP(data.ip))
      .catch(() => setUserIP('Unable to detect'));
  }, []);

  const updateField = (field: keyof CSAFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateZanderSignature = (field: keyof SignatureData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      zanderSignature: { ...prev.zanderSignature, [field]: value }
    }));
  };

  const updateClientSignature = (field: keyof SignatureData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      clientSignature: { ...prev.clientSignature, [field]: value }
    }));
  };

  const canSign = () => {
    return (
      formData.clientName &&
      formData.clientCompany &&
      formData.effectiveDate &&
      formData.selectedPackage &&
      formData.zanderSignature.name &&
      formData.zanderSignature.agreed &&
      formData.clientSignature.name &&
      formData.clientSignature.agreed
    );
  };

  const handleSign = () => {
    if (!canSign()) {
      alert('Please complete all required fields and signature blocks before signing.');
      return;
    }

    const now = new Date().toISOString();
    setFormData(prev => ({
      ...prev,
      status: 'signed',
      zanderSignature: { ...prev.zanderSignature, date: now, ip: userIP },
      clientSignature: { ...prev.clientSignature, date: now, ip: userIP },
    }));
    setIsSigned(true);
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    try {
      window.print();
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please use your browser\'s print function (Ctrl/Cmd + P) and select "Save as PDF".');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEmailCopy = () => {
    alert('Email functionality will be implemented in Phase B. For now, please download the PDF and send manually.');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateExpiration = (effectiveDate: string, weeks: number) => {
    const date = new Date(effectiveDate);
    date.setDate(date.getDate() + (weeks * 7));
    return formatDate(date.toISOString());
  };

  // Styles
  const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '15px',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    backgroundColor: isSigned ? '#F9FAFB' : '#FFFFFF',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: isSigned ? 'default' : 'pointer',
    appearance: 'none',
    backgroundImage: isSigned ? 'none' : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '16px',
    marginTop: '32px',
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: '14px',
    lineHeight: 1.7,
    color: '#374151',
    marginBottom: '16px',
    textAlign: 'justify',
  };

  const subsectionStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: '8px',
    marginTop: '20px',
  };

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .document-container {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .header-section {
            background: #0A0A0F !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: '#F3F4F6',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {/* Header */}
        <header className="header-section no-print" style={{
          background: '#0A0A0F',
          color: '#FFFFFF',
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src="/images/zander-logo-color.svg"
                alt="Zander"
                style={{ width: '140px', height: 'auto' }}
              />
              <div style={{
                width: '1px',
                height: '32px',
                background: 'rgba(255,255,255,0.2)',
              }} />
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#00CFEB',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Legal Documents
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isSigned ? (
                <button
                  onClick={handleSign}
                  disabled={!canSign()}
                  style={{
                    background: canSign() ? '#00CFEB' : 'rgba(255,255,255,0.1)',
                    color: canSign() ? '#000' : 'rgba(255,255,255,0.4)',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: canSign() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Sign Document
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    style={{
                      background: '#00CFEB',
                      color: '#000',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={handleEmailCopy}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Email Copy
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Document Container */}
        <div
          ref={printRef}
          className="document-container"
          style={{
            maxWidth: '900px',
            margin: '32px auto',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Document Header */}
          <div className="header-section" style={{
            background: '#0A0A0F',
            color: '#FFFFFF',
            padding: '40px 48px',
            textAlign: 'center',
          }}>
            <img
              src="/images/zander-logo-color.svg"
              alt="Zander"
              style={{ width: '120px', height: 'auto', marginBottom: '24px' }}
            />
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              CONSULTING SERVICES AGREEMENT
            </h1>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '16px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.6)',
            }}>
              <span>Document ID: <span style={{ color: '#00CFEB' }}>{formData.documentId}</span></span>
              <span>Date: <span style={{ color: '#00CFEB' }}>{formatDate(formData.effectiveDate)}</span></span>
              <span>Status: <span style={{
                color: isSigned ? '#22C55E' : '#F59E0B',
                fontWeight: 600,
              }}>{isSigned ? 'SIGNED' : 'DRAFT'}</span></span>
            </div>
          </div>

          {/* Document Body */}
          <div style={{ padding: '48px' }}>
            {/* Parties Section */}
            <section>
              <h2 style={sectionTitleStyle}>PARTIES</h2>

              <p style={paragraphStyle}>
                This Consulting Services Agreement (&ldquo;Agreement&rdquo;) is entered into as of{' '}
                {isSigned ? (
                  <strong>{formatDate(formData.effectiveDate)}</strong>
                ) : (
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => updateField('effectiveDate', e.target.value)}
                    style={{ ...inputStyle, width: '180px', display: 'inline-block', padding: '6px 10px' }}
                  />
                )}
                {' '}(&ldquo;Effective Date&rdquo;), by and between:
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px',
                marginTop: '24px',
                marginBottom: '32px',
              }}>
                {/* Zander Party */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#00CFEB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                  }}>
                    Consultant (&ldquo;Zander&rdquo;)
                  </h3>
                  <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.8 }}>
                    <p style={{ margin: '0 0 4px' }}><strong>{ZANDER_INFO.company}</strong></p>
                    <p style={{ margin: '0 0 4px' }}>Represented by: {ZANDER_INFO.representative}</p>
                    <p style={{ margin: '0 0 4px' }}>Title: {ZANDER_INFO.title}</p>
                    <p style={{ margin: '0 0 4px' }}>Location: {ZANDER_INFO.address}</p>
                    <p style={{ margin: 0 }}>Email: {ZANDER_INFO.email}</p>
                  </div>
                </div>

                {/* Client Party */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#00CFEB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                  }}>
                    Client
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Company Name *</label>
                      <input
                        type="text"
                        value={formData.clientCompany}
                        onChange={(e) => updateField('clientCompany', e.target.value)}
                        placeholder="Enter company name"
                        disabled={isSigned}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Representative Name *</label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => updateField('clientName', e.target.value)}
                        placeholder="Enter representative name"
                        disabled={isSigned}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => updateField('clientEmail', e.target.value)}
                        placeholder="client@company.com"
                        disabled={isSigned}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Address</label>
                      <input
                        type="text"
                        value={formData.clientAddress}
                        onChange={(e) => updateField('clientAddress', e.target.value)}
                        placeholder="City, State"
                        disabled={isSigned}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Package Selection */}
            <section>
              <h2 style={sectionTitleStyle}>1. SCOPE OF SERVICES</h2>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Select Consulting Package *</label>
                <select
                  value={formData.selectedPackage}
                  onChange={(e) => updateField('selectedPackage', e.target.value)}
                  disabled={isSigned}
                  style={selectStyle}
                >
                  <option value="">-- Select a Package --</option>
                  {PACKAGES.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {formatCurrency(pkg.price)} / {pkg.hours} hours
                    </option>
                  ))}
                </select>
              </div>

              {selectedPackage && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,207,235,0.05) 0%, rgba(0,207,235,0.02) 100%)',
                  border: '2px solid rgba(0,207,235,0.2)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#111827',
                        margin: '0 0 4px',
                      }}>
                        {selectedPackage.name} Package
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: 0,
                      }}>
                        {selectedPackage.description}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        color: '#00CFEB',
                      }}>
                        {formatCurrency(selectedPackage.price)}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#6B7280',
                      }}>
                        {selectedPackage.hours} consulting hours
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                  }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '12px' }}>
                        Deliverables Include:
                      </h4>
                      <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        fontSize: '13px',
                        color: '#4B5563',
                        lineHeight: 1.8,
                      }}>
                        {selectedPackage.deliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', marginBottom: '12px' }}>
                        Engagement Details:
                      </h4>
                      <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.8 }}>
                        <p style={{ margin: '0 0 8px' }}>
                          <strong>Timeline:</strong> {selectedPackage.timeline}
                        </p>
                        <p style={{ margin: '0 0 8px' }}>
                          <strong>Hours Included:</strong> {selectedPackage.hours} hours
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Hours Expiration:</strong> {calculateExpiration(formData.effectiveDate, 24)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <p style={paragraphStyle}>
                Zander agrees to provide consulting services to Client as described above. Services will be
                delivered through a combination of virtual meetings, written deliverables, and asynchronous
                communication as appropriate for the engagement.
              </p>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 style={sectionTitleStyle}>2. PAYMENT TERMS</h2>

              {selectedPackage && (
                <div style={{
                  background: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  color: '#92400E',
                }}>
                  <strong>For this engagement:</strong> {selectedPackage.paymentTerms}
                </div>
              )}

              <p style={subsectionStyle}>2.1 General Payment Terms</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '24px' }}>
                <li>All fees are due in U.S. Dollars</li>
                <li>Payment accepted via bank transfer, credit card, or check</li>
                <li>For packages $4,500 and above: 50% deposit required to secure engagement, balance due before second session</li>
                <li>For packages under $4,500: Full payment due before engagement begins</li>
                <li>Extension purchases ($250) are paid in full at time of purchase</li>
                <li>Ad hoc consulting billed at $250/hour, invoiced monthly</li>
              </ul>

              <p style={subsectionStyle}>2.2 Late Payment</p>
              <p style={paragraphStyle}>
                Invoices not paid within fifteen (15) days of due date may be subject to a late fee of 1.5%
                per month (18% annually). Zander reserves the right to suspend services until outstanding
                balances are paid in full.
              </p>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 style={sectionTitleStyle}>3. CANCELLATION AND REFUND POLICY</h2>

              <p style={subsectionStyle}>3.1 Client-Initiated Cancellation</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '24px' }}>
                <li><strong>Before first session:</strong> Full refund minus 10% administrative fee</li>
                <li><strong>After first session:</strong> No refund. Remaining hours may be used within the
                    original or extended timeline. Hours are non-transferable to other parties.</li>
                <li><strong>Written notice required:</strong> Cancellation must be submitted in writing via
                    email to {ZANDER_INFO.email}</li>
                <li><strong>Hours logged:</strong> Any hours already logged at time of cancellation will be
                    billed at the ad hoc rate ($250/hour) and deducted from any refundable amount.</li>
              </ul>

              <p style={subsectionStyle}>3.2 Zander-Initiated Termination</p>
              <p style={paragraphStyle}>
                Zander reserves the right to terminate this Agreement and provide a prorated refund for unused
                hours in cases of: (a) non-cooperation or unresponsiveness from Client that prevents progress,
                (b) abusive or unprofessional behavior toward Zander or Zander&apos;s team, or (c) material breach
                of this Agreement or any related agreements.
              </p>
            </section>

            {/* Anti-Theft and Time Protection */}
            <section>
              <h2 style={sectionTitleStyle}>4. WORK PRODUCT AND DELIVERABLES</h2>

              <p style={subsectionStyle}>4.1 Delivery Conditions</p>
              <ul style={{ ...paragraphStyle, paddingLeft: '24px' }}>
                <li>All final work product is deliverable only upon full payment</li>
                <li>Draft or partial deliverables may be shared during the engagement for review and
                    collaboration purposes only</li>
                <li>Client cancellation mid-engagement: Draft deliverables will be recalled, access to
                    shared documents revoked, and strategic recommendations remain covered by any
                    applicable NDA</li>
              </ul>

              <p style={subsectionStyle}>4.2 Time Protection</p>
              <p style={paragraphStyle}>
                Time logged is time owed. If Client terminates this Agreement after sessions have occurred,
                the time already invested by Zander is compensable at the ad hoc rate of $250/hour, to be
                deducted from any refundable balance.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 style={sectionTitleStyle}>5. INTELLECTUAL PROPERTY</h2>

              <p style={subsectionStyle}>5.1 Zander Intellectual Property</p>
              <p style={paragraphStyle}>
                The following remain the exclusive property of Zander Systems LLC: the &ldquo;Operating Simply&rdquo;
                methodology, the 10-Pillar Scorecard framework, the 4 Pillars architecture (People, Products,
                Projects, Production), all proprietary templates, tools, software, and any materials developed
                independently by Zander. Client receives a limited, non-exclusive, non-transferable license
                to use these materials solely for Client&apos;s internal business operations.
              </p>

              <p style={subsectionStyle}>5.2 Client Intellectual Property</p>
              <p style={paragraphStyle}>
                All Client pre-existing intellectual property, including business information, trade secrets,
                customer data, and proprietary processes, remains the sole property of Client.
              </p>

              <p style={subsectionStyle}>5.3 Custom Work Product</p>
              <p style={paragraphStyle}>
                Custom deliverables created specifically for Client (e.g., custom SOPs, tailored strategy
                documents, Client-specific analyses) become Client&apos;s property upon full payment. However,
                generic templates, frameworks, and methodological components incorporated into such deliverables
                remain Zander property.
              </p>
            </section>

            {/* Financial Advice Disclaimer */}
            <section>
              <h2 style={sectionTitleStyle}>6. FINANCIAL ADVICE DISCLAIMER</h2>

              <div style={{
                background: '#FEE2E2',
                border: '2px solid #EF4444',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
              }}>
                <p style={{ ...paragraphStyle, color: '#991B1B', fontWeight: 600, marginBottom: '12px' }}>
                  IMPORTANT NOTICE:
                </p>
                <p style={{ ...paragraphStyle, color: '#7F1D1D', marginBottom: 0 }}>
                  Zander Systems LLC and Jonathan White are NOT licensed financial advisors, CPAs, CFOs,
                  or fiduciaries. All guidance provided under this Agreement is operational and strategic
                  in nature only.
                </p>
              </div>

              <ul style={{ ...paragraphStyle, paddingLeft: '24px' }}>
                <li>Financial information, projections, budgets, and recommendations provided during the
                    engagement are for informational and planning purposes only</li>
                <li>Client is strongly advised to consult with licensed professionals (CPAs, attorneys,
                    financial advisors) for tax, legal, and financial decisions</li>
                <li>Zander accepts no liability for financial outcomes resulting from implementation of
                    any recommendations made during the engagement</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 style={sectionTitleStyle}>7. LIMITATION OF LIABILITY</h2>

              <p style={subsectionStyle}>7.1 Liability Cap</p>
              <p style={paragraphStyle}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZANDER&apos;S TOTAL LIABILITY UNDER THIS AGREEMENT SHALL
                NOT EXCEED THE TOTAL AMOUNT PAID BY CLIENT FOR THE SERVICES UNDER THIS AGREEMENT.
              </p>

              <p style={subsectionStyle}>7.2 Exclusion of Damages</p>
              <p style={paragraphStyle}>
                IN NO EVENT SHALL ZANDER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF BUSINESS,
                LOSS OF DATA, OR BUSINESS INTERRUPTION, REGARDLESS OF WHETHER SUCH DAMAGES WERE
                FORESEEABLE OR WHETHER ZANDER WAS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>

              <p style={subsectionStyle}>7.3 Indemnification</p>
              <p style={paragraphStyle}>
                Client agrees to indemnify, defend, and hold harmless Zander and its affiliates, officers,
                agents, and employees from any claims, liabilities, damages, losses, or expenses (including
                reasonable attorney&apos;s fees) arising from Client&apos;s implementation of recommendations made
                during the engagement or Client&apos;s breach of this Agreement.
              </p>

              <p style={subsectionStyle}>7.4 Force Majeure</p>
              <p style={paragraphStyle}>
                Neither Party shall be liable for any failure or delay in performance due to circumstances
                beyond its reasonable control, including but not limited to acts of God, natural disasters,
                war, terrorism, pandemic, government actions, or failure of third-party services.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 style={sectionTitleStyle}>8. DISPUTE RESOLUTION</h2>

              <p style={paragraphStyle}>
                In the event of any dispute arising under this Agreement, the Parties agree to the following
                resolution process:
              </p>

              <p style={subsectionStyle}>Step 1: Good Faith Negotiation</p>
              <p style={paragraphStyle}>
                The Parties shall first attempt to resolve any dispute through good faith negotiation for
                a period of thirty (30) days from written notice of the dispute.
              </p>

              <p style={subsectionStyle}>Step 2: Mediation</p>
              <p style={paragraphStyle}>
                If negotiation fails, the Parties agree to submit the dispute to non-binding mediation
                in Cobb County, Georgia, with a mutually agreed-upon mediator. Each Party shall bear
                its own costs, and mediation costs shall be shared equally.
              </p>

              <p style={subsectionStyle}>Step 3: Binding Arbitration</p>
              <p style={paragraphStyle}>
                If mediation fails, the dispute shall be resolved by binding arbitration in accordance
                with the rules of the American Arbitration Association. Arbitration shall take place in
                Cobb County, Georgia, and shall be governed by Georgia law. The prevailing Party shall
                be entitled to recover reasonable attorney&apos;s fees and costs.
              </p>
            </section>

            {/* Bad Actor Protection */}
            <section>
              <h2 style={sectionTitleStyle}>9. ADDITIONAL PROTECTIVE PROVISIONS</h2>

              <p style={subsectionStyle}>9.1 Non-Solicitation</p>
              <p style={paragraphStyle}>
                For a period of twelve (12) months following the conclusion of services under this Agreement,
                Client agrees not to directly or indirectly solicit, recruit, or hire any employee, contractor,
                or consultant of Zander with whom Client had contact during the engagement.
              </p>

              <p style={subsectionStyle}>9.2 Non-Circumvention</p>
              <p style={paragraphStyle}>
                Client agrees not to use introductions, contacts, or relationships provided by Zander during
                the engagement to circumvent Zander&apos;s business relationships or pursue business opportunities
                that would otherwise involve Zander.
              </p>

              <p style={subsectionStyle}>9.3 Scope Creep Protection</p>
              <p style={paragraphStyle}>
                Any work requested by Client that falls outside the scope of services defined in Section 1
                shall be billed at the ad hoc rate of $250/hour and requires written agreement from both
                Parties before work commences.
              </p>

              <p style={subsectionStyle}>9.4 Platform Access</p>
              <p style={paragraphStyle}>
                If Client is granted access to any Zander software platforms or tools as part of this engagement,
                such access may be revoked within twenty-four (24) hours of: (a) engagement cancellation,
                (b) non-payment, or (c) breach of this Agreement. Client will have thirty (30) days from
                notice of termination to export any Client-owned data from the platform.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 style={sectionTitleStyle}>10. GOVERNING LAW AND VENUE</h2>
              <p style={paragraphStyle}>
                This Agreement shall be governed by and construed in accordance with the laws of the
                <strong> State of Georgia</strong>, without regard to its conflict of laws principles. Any legal
                action or proceeding arising under this Agreement shall be brought exclusively in the state
                or federal courts located in <strong>Cobb County, Georgia</strong>, and each Party hereby consents
                to the personal jurisdiction of such courts.
              </p>
            </section>

            {/* General Provisions */}
            <section>
              <h2 style={sectionTitleStyle}>11. GENERAL PROVISIONS</h2>

              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>
                <strong>11.1 Entire Agreement.</strong> This Agreement, together with any related NDA between
                the Parties, constitutes the entire agreement and supersedes all prior negotiations and agreements.
              </p>

              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>
                <strong>11.2 Amendment.</strong> This Agreement may only be amended by a written instrument
                signed by both Parties.
              </p>

              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>
                <strong>11.3 Waiver.</strong> No waiver of any term shall be valid unless in writing. No waiver
                of any breach shall constitute a waiver of any subsequent breach.
              </p>

              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>
                <strong>11.4 Severability.</strong> If any provision is held invalid, the remaining provisions
                shall continue in full force and effect.
              </p>

              <p style={paragraphStyle}>
                <strong>11.5 Independent Contractor.</strong> Zander is an independent contractor. Nothing in
                this Agreement creates an employment, partnership, joint venture, or agency relationship.
              </p>
            </section>

            {/* Signature Section */}
            <section style={{ marginTop: '48px' }}>
              <h2 style={sectionTitleStyle}>SIGNATURES</h2>
              <p style={paragraphStyle}>
                IN WITNESS WHEREOF, the Parties have executed this Consulting Services Agreement as of the
                Effective Date first written above.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px',
                marginTop: '32px',
              }}>
                {/* Zander Signature */}
                <div style={{
                  background: '#F8FAFC',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#00CFEB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '20px',
                  }}>
                    Zander Systems LLC
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Signature (Type Full Name) *</label>
                    <input
                      type="text"
                      value={formData.zanderSignature.name}
                      onChange={(e) => updateZanderSignature('name', e.target.value)}
                      placeholder="Type full legal name"
                      disabled={isSigned}
                      style={{
                        ...inputStyle,
                        fontFamily: "'Brush Script MT', cursive",
                        fontSize: '20px',
                        fontStyle: 'italic',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Title</label>
                    <input
                      type="text"
                      value={formData.zanderSignature.title || ZANDER_INFO.title}
                      onChange={(e) => updateZanderSignature('title', e.target.value)}
                      disabled={isSigned}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Date</label>
                    <input
                      type="text"
                      value={isSigned ? formatDate(formData.zanderSignature.date) : 'Auto-populated upon signing'}
                      disabled
                      style={{ ...inputStyle, backgroundColor: '#F9FAFB' }}
                    />
                  </div>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    fontSize: '13px',
                    color: '#374151',
                    cursor: isSigned ? 'default' : 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.zanderSignature.agreed}
                      onChange={(e) => updateZanderSignature('agreed', e.target.checked)}
                      disabled={isSigned}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginTop: '2px',
                        accentColor: '#00CFEB',
                      }}
                    />
                    <span>
                      I agree that typing my name above constitutes my electronic signature under the
                      ESIGN Act and UETA, and I intend to be legally bound by this Agreement.
                    </span>
                  </label>

                  {isSigned && formData.zanderSignature.ip && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: '#ECFDF5',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#047857',
                    }}>
                      Signed from IP: {formData.zanderSignature.ip}
                    </div>
                  )}
                </div>

                {/* Client Signature */}
                <div style={{
                  background: '#F8FAFC',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#00CFEB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '20px',
                  }}>
                    {formData.clientCompany || 'Client Company'}
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Signature (Type Full Name) *</label>
                    <input
                      type="text"
                      value={formData.clientSignature.name}
                      onChange={(e) => updateClientSignature('name', e.target.value)}
                      placeholder="Type full legal name"
                      disabled={isSigned}
                      style={{
                        ...inputStyle,
                        fontFamily: "'Brush Script MT', cursive",
                        fontSize: '20px',
                        fontStyle: 'italic',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Title</label>
                    <input
                      type="text"
                      value={formData.clientSignature.title}
                      onChange={(e) => updateClientSignature('title', e.target.value)}
                      placeholder="e.g., CEO, Owner, Manager"
                      disabled={isSigned}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Date</label>
                    <input
                      type="text"
                      value={isSigned ? formatDate(formData.clientSignature.date) : 'Auto-populated upon signing'}
                      disabled
                      style={{ ...inputStyle, backgroundColor: '#F9FAFB' }}
                    />
                  </div>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    fontSize: '13px',
                    color: '#374151',
                    cursor: isSigned ? 'default' : 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.clientSignature.agreed}
                      onChange={(e) => updateClientSignature('agreed', e.target.checked)}
                      disabled={isSigned}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginTop: '2px',
                        accentColor: '#00CFEB',
                      }}
                    />
                    <span>
                      I agree that typing my name above constitutes my electronic signature under the
                      ESIGN Act and UETA, and I intend to be legally bound by this Agreement.
                    </span>
                  </label>

                  {isSigned && formData.clientSignature.ip && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: '#ECFDF5',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#047857',
                    }}>
                      Signed from IP: {formData.clientSignature.ip}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Footer */}
            <div style={{
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: '1px solid #E5E7EB',
              textAlign: 'center',
              fontSize: '12px',
              color: '#9CA3AF',
            }}>
              <p style={{ margin: '0 0 8px' }}>
                This document was generated by Zander Systems LLC
              </p>
              <p style={{ margin: 0 }}>
                Questions? Contact jonathan@zanderos.com
              </p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="no-print" style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isSigned ? '#059669' : '#0A0A0F',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '50px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isSigned ? '#34D399' : '#F59E0B',
          }} />
          {isSigned ? (
            <>
              Document Signed &bull; {selectedPackage?.name} Package &bull; {formatDate(formData.zanderSignature.date)}
            </>
          ) : (
            <>
              Draft &bull; {selectedPackage ? `${selectedPackage.name} - ${formatCurrency(selectedPackage.price)}` : 'Select a package'} &bull; {userIP ? `IP: ${userIP}` : 'Detecting...'}
            </>
          )}
        </div>
      </div>
    </>
  );
}
