import Image from 'next/image';

export const metadata = {
  title: 'Privacy Policy - Zander',
  description: 'Zander Privacy Policy - How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
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
        }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem' }}>
          Last updated: March 29, 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>1. Introduction</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              Zander Systems LLC (&quot;Zander,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered business operations platform.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>2. Information We Collect</h2>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Information You Provide</h3>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem' }}>
              <li>Account information (name, email, company name)</li>
              <li>Payment information (processed securely via Stripe)</li>
              <li>Business data you connect (emails, calendars, contacts, CRM data)</li>
              <li>Communications with our support team</li>
            </ul>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: '1.5rem' }}>Information Collected Automatically</h3>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem' }}>
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>3. How We Use Your Information</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1rem' }}>We use your information to:</p>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem' }}>
              <li>Provide and operate the Zander platform</li>
              <li>Power AI executives to manage your business operations</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative communications</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Improve and develop our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>4. Data Isolation and Security</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              <strong>Your data is yours.</strong> Each business account is fully isolated. We implement industry-standard security measures including:
            </p>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem', marginTop: '1rem' }}>
              <li>End-to-end encryption for data in transit</li>
              <li>Encryption at rest for stored data</li>
              <li>Strict access controls and authentication</li>
              <li>Regular security audits and monitoring</li>
              <li>SOC 2 Type II compliance (in progress)</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>5. Data Sharing</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1rem' }}>
              <strong>We do not sell your data.</strong> We only share information in the following circumstances:
            </p>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem' }}>
              <li><strong>Service Providers:</strong> Third parties that help us operate (hosting, payment processing, analytics)</li>
              <li><strong>Integration Partners:</strong> When you connect third-party services (Gmail, Calendar, etc.)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>6. Third-Party Integrations</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              Zander integrates with third-party services like Google (Gmail, Calendar), Twilio (SMS), Calendly, and Stripe. When you connect these services, you authorize us to access data according to the permissions you grant. Each integration follows OAuth standards and you can revoke access at any time.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>7. Your Rights</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1rem' }}>You have the right to:</p>
            <ul style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem' }}>
              <li>Access and receive a copy of your data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '1rem' }}>
              To exercise these rights, contact us at <a href="mailto:privacy@zanderos.com" style={{ color: '#00CFEB' }}>privacy@zanderos.com</a>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>8. Data Retention</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              We retain your data for as long as your account is active or as needed to provide services. When you delete your account, we delete or anonymize your data within 30 days, except where we&apos;re required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>9. Cookies</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              We use cookies and similar technologies for authentication, preferences, analytics, and security. You can control cookies through your browser settings, but disabling certain cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>10. Children&apos;s Privacy</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              Zander is not intended for use by anyone under 18. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>11. Changes to This Policy</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              We may update this Privacy Policy from time to time. We will notify you of material changes by email or through the platform. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#00CFEB' }}>12. Contact Us</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              If you have questions about this Privacy Policy or our data practices:
            </p>
            <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.75)' }}>
              <p><strong>Zander Systems LLC</strong></p>
              <p>Email: <a href="mailto:privacy@zanderos.com" style={{ color: '#00CFEB' }}>privacy@zanderos.com</a></p>
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
