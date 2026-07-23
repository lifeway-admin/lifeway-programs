import { Link } from 'react-router-dom'

export default function Founder() {
  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">The Soul Behind Lifeway Center</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">Meet Our Founder</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            A woman of vision, resilience, and faith who has devoted her life to helping others soar.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <img
              src="/images/team/mayelin-lima.jpg"
              alt="Mayelin Lima"
              className="w-36 h-36 rounded-full border-4 border-lw-pink object-cover shadow-lg mx-auto mb-5"
            />
            <p className="font-bold text-lw-navy text-lg">Mayelin Lima</p>
            <p className="text-gray-500 text-sm">President &amp; CEO, Lifeway Center</p>
            <p className="italic text-gray-500 text-sm mt-1">"They will soar on wings like eagles…", Isaiah 40:31</p>
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">
            <strong className="text-lw-navy">Mayelin Lima</strong> is a Licensed Clinical Social Worker, bilingual in English
            and Spanish, with over 20 years of experience in healthcare and behavioral health. Her unwavering belief in the
            God-given potential within every person she serves shapes everything Lifeway Center does.
          </p>

          <div className="bg-lw-pink-light rounded-2xl px-6 py-5 text-center mb-8">
            <p className="font-semibold text-lw-navy">"Linking Individuals to Their Soaring Potential."</p>
            <p className="text-xs text-gray-500 mt-1">Mayelin's founding mission for Lifeway Center</p>
          </div>

          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-xl font-bold text-lw-navy mb-4">
              <span>👣</span> Her Journey
            </h3>
            <ul className="space-y-3 text-gray-600 leading-relaxed list-disc pl-5">
              <li>
                <span className="font-semibold text-lw-navy">Education:</span> Master of Social Work, Florida International
                University · Licensed Clinical Social Worker (SW8980), certified in infant mental health and behavioral analysis
              </li>
              <li>
                <span className="font-semibold text-lw-navy">Leadership:</span> Led behavioral health programs across
                outpatient clinics, residential treatment, youth services, and re-entry support with the Department of
                Corrections, building trauma-informed, culturally competent care
              </li>
              <li>
                <span className="font-semibold text-lw-navy">Faith &amp; Community:</span> Inspired by Isaiah 40:31 and active
                in church ministry, she leads workshops on faith-based mental health, leadership development, family therapy,
                and organizational resilience
              </li>
            </ul>
          </div>

          <blockquote className="border-l-4 border-lw-pink pl-5 italic text-gray-500 mb-8">
            "When someone walks through our doors, they're not just a client. They're someone's daughter. Someone's father.
            Someone's dreamer. I see the person beyond the pain, the story beyond the struggle.", Mayelin Lima
          </blockquote>

          <p className="text-gray-600 leading-relaxed">
            Founded on over 15 years of field-tested experience, <strong className="text-lw-navy">Lifeway Center</strong> walks
            alongside families through trauma, addiction, and grief, building bridges, not just providing services, so
            individuals and families can thrive, not just survive. Mayelin is available for speaking engagements, clinical
            trainings, and wellness consultations,{' '}
            <Link to="/contact" className="text-lw-pink font-semibold hover:underline">get in touch</Link>.
          </p>
        </div>
      </section>
    </div>
  )
}
