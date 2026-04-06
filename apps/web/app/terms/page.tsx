import Image from 'next/image';

export const metadata = {
  title: 'Terms of Service - Zander',
  description: 'Zander Terms of Service - The agreement governing your use of Zander.',
};

export default function TermsPage() {
  return (
    <div style={{
      fontFamily: "'Inter', var(--font-inter), sans-serif",
      background: '#080A0F',
      color: '#FFFFFF',
      minHeight: '100vh',
      lineHeight: 1.75,
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '1.5rem 2rem',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/">
            <Image
              src="/images/zander-logo-white.svg"
              alt="Zander"
              width={120}
              height={30}
              style={{ height: '28px', width: 'auto' }}
            />
          </a>
          <a href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem' }}>
            &larr; Back to Home
          </a>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 style={{
          fontFamily: "'Sora', var(--font-sora), sans-serif",
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>Terms of Service</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem' }}>
          Last updated: March 29, 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>1. Agreement to Terms</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Zander Systems LLC (&quot;Zander,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your access to and use of the Zander platform, including our website at zanderos.com and app.zanderos.com, and all related services (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>2. Description of Service</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              Zander is an AI-powered business operations platform that provides automated executive assistance through AI agents (&quot;AI Executives&quot;) including executive assistants (Pam), marketing executives (Don), and revenue executives (Jordan). The Service integrates with third-party platforms to help manage your business communications, calendar, pipeline, and marketing operations.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>3. Account Registration</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1rem' }}>To use the Service, you must:</p>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem' }}>
              <li>Be at least 18 years old</li>
              <li>Provide accurate, complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update your information if it changes</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>4. Subscription Plans and Pricing</h2>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Founding 50 Program</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1rem' }}>
              Founding members receive their subscription rate locked for life. This means your monthly rate will not increase, and new features and AI Executives will be included at no additional cost.
            </p>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Refund Policy</h3>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>30-Day Money-Back Guarantee:</strong> New subscribers are eligible for a full refund of their first monthly subscription payment within 30 days of initial purchase, no questions asked. Refund requests should be submitted to <a href="mailto:support@zanderos.com" style={{ color: '#00CFEB' }}>support@zanderos.com</a>.
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                After the initial 30-day period, monthly subscriptions are non-refundable for partial months.
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                The $49 Founding Member waitlist fee is non-refundable.
              </li>
              <li>
                <strong>Annual subscriptions:</strong> Pro-rata refund available within first 30 days only.
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>5. Billing and Cancellation</h2>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem' }}>
              <li>Subscriptions are billed monthly in advance</li>
              <li>You may cancel your subscription at any time</li>
              <li>Cancellation takes effect at the end of your current billing period</li>
              <li>No refunds for partial months (except under the 30-day guarantee)</li>
              <li>We may change pricing with 30 days&apos; notice (does not affect founding rates)</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>6. Acceptable Use</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1rem' }}>You agree not to:</p>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem' }}>
              <li>Use the Service for any illegal purpose</li>
              <li>Send spam, unsolicited communications, or phishing attempts</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use the Service to harm, harass, or deceive others</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>7. AI-Generated Content Disclaimer</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              AI-generated content and recommendations provided by Zander&apos;s executive team (including but not limited to Pam, Jordan, Don, Ben, Miranda, Ted, and Jarvis) are for informational and organizational purposes only. They do not constitute professional financial, legal, tax, medical, or investment advice. Users should consult qualified professionals before making decisions based on AI-generated recommendations. Zander Systems LLC is not liable for actions taken based on AI executive output.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>8. AI Executive Actions</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1rem' }}>
              <strong>Human Approval Required:</strong> All outbound communications (emails, SMS, etc.) drafted by AI Executives require your approval before sending. You are responsible for reviewing and approving all external communications.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              <strong>Accuracy:</strong> While our AI Executives are designed to be helpful and accurate, they may occasionally make errors. You are responsible for verifying important information and decisions.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>9. Your Data</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1rem' }}>
              You retain all rights to your data. By using the Service, you grant us a limited license to use your data solely to provide the Service. We will not sell your data or use it for purposes other than operating and improving the Service.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              See our <a href="/privacy" style={{ color: '#00CFEB' }}>Privacy Policy</a> for details on how we handle your data.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>10. Third-Party Integrations</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              The Service integrates with third-party platforms (Google, Twilio, Calendly, Stripe, etc.). Your use of these integrations is subject to the respective third party&apos;s terms of service. We are not responsible for third-party services or their availability.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>11. Intellectual Property</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              The Service, including all content, features, and functionality, is owned by Zander Systems LLC and is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express permission.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>12. Disclaimer of Warranties</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. YOU USE THE SERVICE AT YOUR OWN RISK.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>13. Limitation of Liability</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZANDER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>14. Indemnification</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              You agree to indemnify and hold harmless Zander, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>15. Termination</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              We may suspend or terminate your access to the Service at any time for violation of these Terms or for any other reason at our discretion. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>16. Changes to Terms</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              We may modify these Terms at any time. We will provide notice of material changes via email or through the Service. Your continued use after changes take effect constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>17. Governing Law</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles. Any disputes shall be resolved in the state or federal courts located in Delaware.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>18. Dispute Resolution</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              Before filing any claim, you agree to attempt to resolve disputes informally by contacting us at <a href="mailto:legal@zanderos.com" style={{ color: '#00CFEB' }}>legal@zanderos.com</a>. If we cannot resolve the dispute within 30 days, either party may proceed with formal legal action.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>19. Severability</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              If any provision of these Terms is found unenforceable, the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>20. Entire Agreement</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Zander regarding the Service and supersede all prior agreements.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>21. Contact Us</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              If you have questions about these Terms:
            </p>
            <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.75)' }}>
              <p><strong>Zander Systems LLC</strong></p>
              <p>Email: <a href="mailto:legal@zanderos.com" style={{ color: '#00CFEB' }}>legal@zanderos.com</a></p>
              <p>Support: <a href="mailto:support@zanderos.com" style={{ color: '#00CFEB' }}>support@zanderos.com</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
          &copy; 2026 Zander Systems LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
