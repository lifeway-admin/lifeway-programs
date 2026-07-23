import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

const EFFECTIVE_DATE = 'May 27, 2026'
const ORG = 'LifeWay Center (Lifeway Programs, Inc.)'
const ADDRESS = '15300 SW 288th Street, Homestead, FL 33033'
const PHONE = '(888) 331-3060'
const FAX = '305-328-8345'

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-lw-navy mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed text-sm">{children}</div>
    </div>
  )
}

export default function Hipaa() {
  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <FileText size={36} className="text-lw-pink mx-auto mb-4" />
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Legal · HIPAA</span>
          <h1 className="text-4xl font-bold mt-2 mb-3">Notice of Privacy Practices</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm mt-3 leading-relaxed">
            This notice describes how medical information about you may be used and disclosed,
            and how you can get access to this information. <strong>Please review it carefully.</strong>
          </p>
          <p className="text-gray-400 text-xs mt-4">Effective Date: {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <section className="section">
        <div className="max-w-3xl mx-auto">

          {/* Required HIPAA callout */}
          <div className="bg-lw-pink-light border border-pink-100 rounded-2xl p-6 mb-10 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-lw-navy mb-1">Our Commitment to Your Privacy</p>
            <p>
              {ORG} is required by law to maintain the privacy of your Protected Health Information (PHI),
              provide you with this Notice of our legal duties and privacy practices, and follow the terms
              of the Notice currently in effect. We are committed to protecting your health information and
              will use or disclose it only as described in this Notice or as otherwise permitted by law.
            </p>
          </div>

          <Section title="1. What is Protected Health Information (PHI)?">
            <p>
              PHI is any information we create or receive about your past, present, or future physical or
              mental health condition; the provision of health care to you; or payment for that care,
              that can be used to identify you. This includes your name, address, date of birth, diagnosis,
              treatment records, and payment information.
            </p>
          </Section>

          <Section title="2. How We May Use and Disclose Your PHI">
            <p>We may use and disclose your PHI for the following purposes without your written authorization:</p>

            <p className="font-semibold text-lw-navy mt-4">Treatment</p>
            <p>
              We may use and share your PHI with other health care providers involved in your treatment.
              For example, we may share information with a specialist, hospital, or referral provider to
              coordinate your care.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Payment</p>
            <p>
              We may use and disclose your PHI to obtain payment for services, including billing Medicaid,
              Medicare, or private insurance on your behalf. For example, we may submit a claim describing
              the services provided to you.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Health Care Operations</p>
            <p>
              We may use and disclose your PHI for activities such as quality assessment, staff training,
              compliance reviews, and business management necessary to operate our organization.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Appointment Reminders</p>
            <p>
              We may contact you to remind you of an appointment or provide information about treatment
              alternatives or services that may be of interest to you, via phone, SMS, or email.
            </p>

            <p className="font-semibold text-lw-navy mt-4">As Required by Law</p>
            <p>
              We will disclose your PHI when required to do so by federal, state, or local law, including
              reporting to public health authorities, responding to court orders or subpoenas, reporting
              abuse or neglect as mandated by Florida law, and cooperating with law enforcement as
              permitted by HIPAA.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Public Health and Safety</p>
            <p>
              We may disclose PHI to prevent a serious and imminent threat to your health or safety or
              the health or safety of another person or the public.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Research</p>
            <p>
              We may use your PHI for research purposes under strict conditions and only with appropriate
              privacy protections in place or your written authorization.
            </p>
          </Section>

          <Section title="3. Uses and Disclosures Requiring Your Written Authorization">
            <p>Other uses and disclosures of your PHI not covered by this Notice will be made only with your written authorization, including:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Most uses and disclosures of psychotherapy notes</li>
              <li>Uses and disclosures of PHI for marketing purposes</li>
              <li>Sales of PHI</li>
              <li>Disclosures to family members or friends (unless you are incapacitated or in an emergency)</li>
              <li>Any other use or disclosure not described in this Notice</li>
            </ul>
            <p className="mt-3">
              You may revoke your authorization in writing at any time, except to the extent that we have
              already taken action based on it.
            </p>
          </Section>

          <Section title="4. Special Protections for Certain Information">
            <p>
              Certain types of health information receive additional protections under federal and Florida law.
              We will comply with these additional requirements for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Mental health and behavioral health records</li>
              <li>Substance use disorder records (governed by 42 CFR Part 2)</li>
              <li>HIV/AIDS-related information</li>
              <li>Genetic information</li>
              <li>Records pertaining to minors</li>
            </ul>
          </Section>

          <Section title="5. Your Rights Regarding Your PHI">
            <p>You have the following rights with respect to your health information:</p>

            <p className="font-semibold text-lw-navy mt-4">Right to Access</p>
            <p>
              You have the right to inspect and obtain a copy of your medical records and billing records.
              We may charge a reasonable fee. Requests must be submitted in writing. We will respond within
              30 days.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Right to Amend</p>
            <p>
              If you believe information in your records is incorrect or incomplete, you may request an
              amendment. We may deny the request under certain circumstances but will document your
              disagreement.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Right to an Accounting of Disclosures</p>
            <p>
              You may request a list of certain disclosures we have made of your PHI for purposes other
              than treatment, payment, or operations. This right applies for up to 6 years prior to your request.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Right to Request Restrictions</p>
            <p>
              You may request that we limit how we use or disclose your PHI. We are not required to agree,
              except we must comply with a request to not disclose PHI to your health plan for services
              you paid for out-of-pocket in full.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Right to Confidential Communications</p>
            <p>
              You may request that we contact you by specific means (e.g., only by mail or only at a
              specific phone number). We will accommodate reasonable requests.
            </p>

            <p className="font-semibold text-lw-navy mt-4">Right to a Copy of This Notice</p>
            <p>
              You have the right to a paper copy of this Notice at any time, even if you agreed to receive
              it electronically. You may request a copy at our office or download it from this page.
            </p>
          </Section>

          <Section title="6. Our Duties">
            <p>LifeWay Center is required to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Maintain the privacy of your PHI</li>
              <li>Provide you with this Notice of our privacy practices</li>
              <li>Follow the terms of the Notice currently in effect</li>
              <li>Notify you if a breach of your unsecured PHI occurs</li>
            </ul>
            <p className="mt-3">
              We reserve the right to change this Notice at any time. If we make material changes, the
              new Notice will be effective for all PHI we maintain. The updated Notice will be posted
              on our website and available at our offices.
            </p>
          </Section>

          <Section title="7. How to File a Complaint">
            <p>
              If you believe your privacy rights have been violated, you may file a complaint with us or
              with the U.S. Department of Health and Human Services (HHS) Office for Civil Rights.
              You will not be penalized or retaliated against for filing a complaint.
            </p>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mt-3 space-y-1">
              <p className="font-semibold text-lw-navy">To file a complaint with LifeWay Center:</p>
              <p>{ADDRESS}</p>
              <p>Phone: <a href="tel:8883313060" className="text-lw-pink hover:underline">{PHONE}</a></p>
              <p>Fax: {FAX}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mt-3 space-y-1">
              <p className="font-semibold text-lw-navy">To file a complaint with HHS:</p>
              <p>U.S. Department of Health and Human Services</p>
              <p>200 Independence Avenue, S.W., Washington, D.C. 20201</p>
              <p><a href="https://www.hhs.gov/ocr/privacy/hipaa/complaints/" target="_blank" rel="noreferrer" className="text-lw-pink hover:underline">hhs.gov/ocr/privacy/hipaa/complaints</a></p>
              <p>Toll-free: 1-877-696-6775</p>
            </div>
          </Section>

          <Section title="8. Contact Our Privacy Officer">
            <p>
              For questions about this Notice or to exercise any of your rights, please contact:
            </p>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mt-3">
              <p className="font-semibold text-lw-navy">{ORG}, Privacy Officer</p>
              <p>{ADDRESS}</p>
              <p>Phone: <a href="tel:8883313060" className="text-lw-pink hover:underline">{PHONE}</a></p>
              <p className="mt-2">
                <Link to="/contact" className="text-lw-pink font-semibold hover:underline">Send us a message →</Link>
              </p>
            </div>
          </Section>

          <div className="border-t border-gray-100 pt-8 text-xs text-gray-400 space-y-2">
            <p>Effective Date: {EFFECTIVE_DATE}</p>
            <p>
              This Notice is provided in compliance with the Health Insurance Portability and Accountability
              Act of 1996 (HIPAA) and the HITECH Act. LifeWay Center recommends consulting with a qualified
              healthcare compliance attorney to ensure full regulatory compliance for your specific situation.
            </p>
            <p>
              <Link to="/privacy" className="text-lw-pink hover:underline">View our Privacy Policy →</Link>
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
