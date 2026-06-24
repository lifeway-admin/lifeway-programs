import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

const EFFECTIVE_DATE = 'May 27, 2026'
const ORG = 'LifeWay Center (Lifeway Programs, Inc.)'
const ADDRESS = '15300 SW 288th Street, Homestead, FL 33033'
const PHONE = '(888) 331-3060'

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-lw-navy mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed text-sm">{children}</div>
    </div>
  )
}

export default function Privacy() {
  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <Shield size={36} className="text-lw-pink mx-auto mb-4" />
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Legal</span>
          <h1 className="text-4xl font-bold mt-2 mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <section className="section">
        <div className="max-w-3xl mx-auto">

          <div className="bg-lw-pink-light border border-pink-100 rounded-2xl p-6 mb-10 text-sm text-gray-600 leading-relaxed">
            <p>
              {ORG} ("LifeWay Center," "we," "us," or "our") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard information when you visit our
              website, use our online booking system, or interact with our services. If you are a current or
              prospective patient, please also review our{' '}
              <Link to="/hipaa" className="text-lw-pink font-semibold hover:underline">HIPAA Notice of Privacy Practices</Link>,
              which governs the use of your Protected Health Information.
            </p>
          </div>

          <Section title="1. Information We Collect">
            <p><strong className="text-lw-navy">Information you provide directly:</strong></p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Contact form submissions — name, email address, phone number, and message content</li>
              <li>Appointment booking — name, contact details, service type, preferred provider, and scheduling preferences</li>
              <li>Intake forms — health history and information necessary to provide care (governed by HIPAA)</li>
              <li>Donation forms — name, email, and payment information (processed securely by Stripe)</li>
            </ul>
            <p className="mt-3"><strong className="text-lw-navy">Information collected automatically:</strong></p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Browser type, operating system, and device information</li>
              <li>IP address and general geographic region</li>
              <li>Pages visited and time spent on the site</li>
              <li>Referring website or link</li>
            </ul>
            <p className="mt-3">We do not use tracking cookies or third-party advertising networks.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect solely to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Schedule and confirm appointments</li>
              <li>Communicate with you about your care or inquiries</li>
              <li>Send appointment reminders via email or SMS (with your consent)</li>
              <li>Process donations securely</li>
              <li>Improve our website and services</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or trade your personal information to any third party for marketing purposes.</p>
          </Section>

          <Section title="3. Third-Party Services">
            <p>We use the following third-party services to operate our platform. Each has their own privacy policy:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-lw-navy">Stripe</strong> — Payment processing for donations and service fees. Stripe handles all payment card data; we never store card numbers. <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer" className="text-lw-pink hover:underline">Stripe Privacy Policy</a></li>
              <li><strong className="text-lw-navy">Google Meet</strong> — Telehealth video appointments are conducted via Google Meet, governed by Google's privacy policy. <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-lw-pink hover:underline">Google Privacy Policy</a></li>
              <li><strong className="text-lw-navy">Twilio</strong> — SMS appointment reminders. Message and data rates may apply.</li>
              <li><strong className="text-lw-navy">Google</strong> — Calendar integration for scheduling. Governed by Google's privacy policy.</li>
            </ul>
          </Section>

          <Section title="4. Health Information (HIPAA)">
            <p>
              If you are a patient or prospective patient, any health information you share with us —
              including information submitted through our booking or intake forms — is considered Protected
              Health Information (PHI) and is governed by the Health Insurance Portability and Accountability
              Act (HIPAA). Please review our{' '}
              <Link to="/hipaa" className="text-lw-pink font-semibold hover:underline">HIPAA Notice of Privacy Practices</Link>{' '}
              for a full description of your rights and our obligations.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain personal contact information (such as contact form submissions) for up to 24 months,
              after which it is securely deleted. Patient health records are retained in accordance with
              HIPAA requirements (minimum 6 years from the date of creation or last use) and applicable
              Florida state law. Financial transaction records are retained as required by tax and accounting law.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement industry-standard security measures to protect your information, including
              encrypted data transmission (HTTPS), access controls, and audit logging for all PHI access.
              No method of electronic transmission is 100% secure, and we cannot guarantee absolute security.
              In the event of a data breach affecting your information, we will notify you as required by law.
            </p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>
              Our website is not directed to children under 13. We do not knowingly collect personal
              information from children under 13 without verifiable parental consent. If you believe a
              child under 13 has provided us with personal information, please contact us immediately.
              For minor patients receiving services, a parent or legal guardian must provide consent.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal data (subject to legal retention requirements)</li>
              <li>Opt out of SMS communications at any time by replying STOP</li>
              <li>Withdraw consent for non-essential communications</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at the information below.
              Patient rights regarding PHI are described in our HIPAA Notice.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the effective
              date at the top of this page. We encourage you to review this policy periodically. Continued
              use of our website after changes are posted constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mt-3 not-italic">
              <p className="font-semibold text-lw-navy">{ORG}</p>
              <p>{ADDRESS}</p>
              <p>Phone: <a href="tel:8883313060" className="text-lw-pink hover:underline">{PHONE}</a></p>
              <p className="mt-2">
                <Link to="/contact" className="text-lw-pink font-semibold hover:underline">Send us a message →</Link>
              </p>
            </div>
          </Section>

          <div className="border-t border-gray-100 pt-8 text-xs text-gray-400">
            <p>
              This policy is provided for informational purposes. LifeWay Center recommends consulting with
              a qualified healthcare compliance attorney to ensure full regulatory compliance for your specific situation.
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
