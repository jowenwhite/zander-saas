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

interface NDAFormData {
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  effectiveDate: string;
  zanderSignature: SignatureData;
  clientSignature: SignatureData;
  documentId: string;
  status: 'draft' | 'pending' | 'signed';
  createdAt: string;
}

const ZANDER_INFO = {
  company: 'Zander Systems LLC',
  representative: 'Jonathan White',
  title: 'Managing Member',
  address: 'Marietta, Georgia',
};

export default function NDAPage() {
  const params = useParams();
  const documentId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<NDAFormData>({
    clientName: '',
    clientCompany: '',
    clientAddress: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    zanderSignature: { name: '', title: '', date: '', agreed: false, ip: '' },
    clientSignature: { name: '', title: '', date: '', agreed: false, ip: '' },
    documentId: documentId || `NDA-${Date.now()}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
  });

  const [userIP, setUserIP] = useState<string>('');
  const [isSigned, setIsSigned] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // Fetch IP address
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIP(data.ip))
      .catch(() => setUserIP('Unable to detect'));
  }, []);

  const updateField = (field: keyof NDAFormData, value: string) => {
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

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Use browser print to PDF
      window.print();
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please use your browser\'s print function (Ctrl/Cmd + P) and select "Save as PDF".');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEmailCopy = async () => {
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
            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
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
              MUTUAL NON-DISCLOSURE AGREEMENT
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
                This Mutual Non-Disclosure Agreement (&ldquo;Agreement&rdquo;) is entered into as of{' '}
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
                    Party A (&ldquo;Zander&rdquo;)
                  </h3>
                  <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.8 }}>
                    <p style={{ margin: '0 0 4px' }}><strong>{ZANDER_INFO.company}</strong></p>
                    <p style={{ margin: '0 0 4px' }}>Represented by: {ZANDER_INFO.representative}</p>
                    <p style={{ margin: '0 0 4px' }}>Title: {ZANDER_INFO.title}</p>
                    <p style={{ margin: 0 }}>Location: {ZANDER_INFO.address}</p>
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
                    Party B (&ldquo;Client&rdquo;)
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

              <p style={paragraphStyle}>
                Zander and Client are collectively referred to herein as the &ldquo;Parties&rdquo; and individually as a &ldquo;Party.&rdquo;
              </p>
            </section>

            {/* Purpose Section */}
            <section>
              <h2 style={sectionTitleStyle}>1. PURPOSE</h2>
              <p style={paragraphStyle}>
                The Parties wish to explore a potential business relationship concerning consulting services
                related to business operations, strategy, and systems implementation (the &ldquo;Purpose&rdquo;).
                In connection with this Purpose, each Party may disclose to the other Party certain confidential
                and proprietary information. This Agreement sets forth the terms and conditions under which such
                information will be disclosed and protected.
              </p>
            </section>

            {/* Definition of Confidential Information */}
            <section>
              <h2 style={sectionTitleStyle}>2. DEFINITION OF CONFIDENTIAL INFORMATION</h2>
              <p style={paragraphStyle}>
                &ldquo;Confidential Information&rdquo; means any and all non-public information disclosed by one Party
                (the &ldquo;Disclosing Party&rdquo;) to the other Party (the &ldquo;Receiving Party&rdquo;), whether orally, in writing,
                or by any other means, including but not limited to:
              </p>
              <ul style={{ ...paragraphStyle, paddingLeft: '24px', marginBottom: '24px' }}>
                <li>Business plans, strategies, and financial information</li>
                <li>Customer and supplier lists, contacts, and relationships</li>
                <li>Marketing plans, pricing information, and competitive analyses</li>
                <li>Technical data, trade secrets, and know-how</li>
                <li>Proprietary methodologies, including the &ldquo;Operating Simply&rdquo; framework,
                    4 Pillars architecture, and 10-Pillar Scorecard system</li>
                <li>Software, systems, and tools developed by or for either Party</li>
                <li>Any information marked as &ldquo;Confidential&rdquo; or that should reasonably be understood
                    to be confidential given the nature of the information and circumstances of disclosure</li>
              </ul>
            </section>

            {/* Obligations */}
            <section>
              <h2 style={sectionTitleStyle}>3. MUTUAL OBLIGATIONS</h2>
              <p style={paragraphStyle}>
                Each Party agrees to:
              </p>
              <ul style={{ ...paragraphStyle, paddingLeft: '24px', marginBottom: '24px' }}>
                <li>Maintain the confidentiality of the other Party&apos;s Confidential Information with at least the
                    same degree of care it uses to protect its own confidential information, but in no event less
                    than reasonable care</li>
                <li>Not disclose any Confidential Information to any third party without the prior written consent
                    of the Disclosing Party</li>
                <li>Use the Confidential Information solely for the Purpose and not for any other purpose</li>
                <li>Limit access to Confidential Information to those employees, contractors, and advisors who
                    have a need to know and who are bound by confidentiality obligations at least as protective
                    as those contained herein</li>
                <li>Promptly notify the Disclosing Party of any unauthorized use or disclosure of Confidential
                    Information</li>
              </ul>
            </section>

            {/* Exclusions */}
            <section>
              <h2 style={sectionTitleStyle}>4. EXCLUSIONS FROM CONFIDENTIAL INFORMATION</h2>
              <p style={paragraphStyle}>
                Confidential Information does not include information that:
              </p>
              <ul style={{ ...paragraphStyle, paddingLeft: '24px', marginBottom: '24px' }}>
                <li>Is or becomes publicly available through no fault of the Receiving Party</li>
                <li>Was rightfully in the Receiving Party&apos;s possession prior to disclosure by the Disclosing Party</li>
                <li>Is independently developed by the Receiving Party without use of or reference to the
                    Disclosing Party&apos;s Confidential Information</li>
                <li>Is rightfully obtained by the Receiving Party from a third party without restriction on
                    disclosure</li>
                <li>Is required to be disclosed by law, regulation, or court order, provided that the Receiving
                    Party gives prompt written notice to the Disclosing Party to permit the Disclosing Party to
                    seek a protective order</li>
              </ul>
            </section>

            {/* Term */}
            <section>
              <h2 style={sectionTitleStyle}>5. TERM AND TERMINATION</h2>
              <p style={paragraphStyle}>
                This Agreement shall remain in effect for a period of <strong>two (2) years</strong> from the Effective Date.
                Either Party may terminate this Agreement at any time upon thirty (30) days&apos; prior written notice
                to the other Party. Notwithstanding termination, the confidentiality obligations set forth herein
                shall survive for a period of <strong>two (2) years</strong> following the termination or expiration of this
                Agreement or the conclusion of any consulting engagement between the Parties, whichever is later.
              </p>
            </section>

            {/* Remedies */}
            <section>
              <h2 style={sectionTitleStyle}>6. REMEDIES</h2>
              <p style={paragraphStyle}>
                Each Party acknowledges that any breach of this Agreement may cause irreparable harm to the
                other Party for which monetary damages would be an inadequate remedy. Accordingly, either Party
                shall be entitled to seek equitable relief, including injunction and specific performance, in
                addition to all other remedies available at law or in equity, without the necessity of proving
                actual damages or posting a bond.
              </p>
            </section>

            {/* Return of Information */}
            <section>
              <h2 style={sectionTitleStyle}>7. RETURN OF INFORMATION</h2>
              <p style={paragraphStyle}>
                Upon termination of this Agreement or upon request by the Disclosing Party, the Receiving Party
                shall promptly return or destroy all Confidential Information and any copies thereof, and shall
                provide written certification of such return or destruction upon request. The Receiving Party
                may retain one (1) archival copy of the Confidential Information solely for the purpose of
                determining its obligations under this Agreement, which copy shall remain subject to the
                confidentiality obligations herein.
              </p>
            </section>

            {/* General Provisions */}
            <section>
              <h2 style={sectionTitleStyle}>8. GENERAL PROVISIONS</h2>

              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>
                <strong>8.1 Governing Law.</strong> This Agreement shall be governed by and construed in accordance
                with the laws of the <strong>State of Georgia</strong>, without regard to its conflict of laws principles.
              </p>

              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>
                <strong>8.2 Venue.</strong> Any disputes arising under this Agreement shall be resolved exclusively
                in the state or federal courts located in <strong>Cobb County, Georgia</strong>, and each Party consents
                to the personal jurisdiction of such courts.
              </p>

              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>
                <strong>8.3 Entire Agreement.</strong> This Agreement constitutes the entire agreement between the
                Parties with respect to the subject matter hereof and supersedes all prior negotiations,
                representations, and agreements relating to this subject matter.
              </p>

              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>
                <strong>8.4 Amendment.</strong> This Agreement may not be amended or modified except by a written
                instrument signed by both Parties.
              </p>

              <p style={{ ...paragraphStyle, marginBottom: '8px' }}>
                <strong>8.5 Waiver.</strong> No waiver of any term or condition of this Agreement shall be valid
                unless in writing and signed by the waiving Party. No waiver of any breach of this Agreement
                shall be deemed a waiver of any subsequent breach.
              </p>

              <p style={paragraphStyle}>
                <strong>8.6 Severability.</strong> If any provision of this Agreement is held to be invalid or
                unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            {/* Signature Section */}
            <section style={{ marginTop: '48px' }}>
              <h2 style={sectionTitleStyle}>SIGNATURES</h2>
              <p style={paragraphStyle}>
                IN WITNESS WHEREOF, the Parties have executed this Mutual Non-Disclosure Agreement as of the
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
            <>Document Signed &bull; {formatDate(formData.zanderSignature.date)}</>
          ) : (
            <>Draft &bull; {userIP ? `Your IP: ${userIP}` : 'Detecting IP...'}</>
          )}
        </div>
      </div>
    </>
  );
}
