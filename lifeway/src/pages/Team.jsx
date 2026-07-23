import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Handshake, GraduationCap, ArrowRight } from 'lucide-react'
import TeamMemberCard from '../components/TeamMemberCard'
import { fadeUp } from '../lib/animations'

const getInvolved = [
  { icon: Briefcase, title: 'Careers', desc: "Explore open roles across clinical, medical, and support positions, we're always looking for compassionate professionals to join our mission." },
  { icon: Handshake, title: 'Partnerships', desc: 'Churches, nonprofits, medical partners, and community organizations, let\'s collaborate to expand access to care.' },
  { icon: GraduationCap, title: 'Internships & Volunteers', desc: 'Gain hands-on experience or give back your time and skills to support our clients and community programs.' },
]

const boardOfDirectors = [
  { name: 'Mayelin Lima', title: 'Board President, Lifeway Programs, Inc.', photo: '/images/team/mayelin-lima.jpg' },
  { name: 'Laura Dahne', title: 'Board Chairwoman, Lifeway Programs, Inc.', photo: '/images/team/laura-dahne.jpg' },
  { name: 'Timothy Tyler', title: 'Board Secretary, Lifeway Programs, Inc.', photo: '/images/team/timothy-tyler.jpg' },
]

const executiveTeam = [
  { name: 'Mayelin Lima', title: 'Founder & Chief Executive Officer', photo: '/images/team/mayelin-lima.jpg' },
  { name: 'Jack Hakimian', title: 'Chief Growth Officer', photo: '/images/team/jack-hakimian.jpg' },
]

const directorTeam = [
  { name: 'German Alfaro', title: 'Clinical Director, LMHC, MS', photo: '/images/team/german-alfaro.jpg' },
  { name: 'Maria Reyes', title: 'Revenue Cycle Specialist, MHSA', photo: '/images/team/maria-reyes.jpg' },
  { name: 'Mayelin Lima', title: 'Licensed Clinical Social Worker, President/CEO', photo: '/images/team/mayelin-lima.jpg' },
  { name: 'Ydania Peralta' },
]

const medicalTeam = [
  { name: 'Misael Gonzalez', title: 'Medical Director, M.D.', photo: '/images/team/misael-gonzalez.jpg' },
  { name: 'Neyma Perez-Suarez' },
  { name: 'Richard E. Arevalo', title: 'Family Nurse Practitioner, MSN', photo: '/images/team/richard-arevalo.jpg' },
  { name: 'Sam Moss' },
  { name: 'Yisel Neyra Fajadro', title: 'MSN, APRN, FNP-C', photo: '/images/team/yisel-neyra-fajadro.jpg' },
  { name: 'Barbara Mojena' },
]

export default function Team() {
  return (
    <div>
      {/* Header */}
      <section className="relative bg-lw-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">The People Behind Our Mission</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">Our Team</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            Dedicated professionals who combine clinical excellence with compassion, faith, and a deep commitment to the communities we serve.
          </p>
        </div>
      </section>

      <section className="section">
        {/* Board of Directors */}
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-lw-pink text-center mb-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          Board of Directors
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {boardOfDirectors.map((m, i) => (
            <motion.div key={`board-${i}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} transition={{ ...fadeUp.show.transition, delay: (i % 3) * 0.1 }}>
              <TeamMemberCard {...m} />
            </motion.div>
          ))}
        </div>

        {/* Executive Team */}
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-lw-pink text-center mb-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          Executive Team
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-16 max-w-2xl mx-auto">
          {executiveTeam.map((m, i) => (
            <motion.div key={`exec-${i}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} transition={{ ...fadeUp.show.transition, delay: i * 0.1 }}>
              <TeamMemberCard {...m} />
            </motion.div>
          ))}
        </div>

        {/* Director Team */}
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-lw-pink text-center mb-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          Director Team
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {directorTeam.map((m, i) => (
            <motion.div key={`director-${i}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} transition={{ ...fadeUp.show.transition, delay: (i % 3) * 0.1 }}>
              <TeamMemberCard {...m} />
            </motion.div>
          ))}
        </div>

        {/* Medical Team */}
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-lw-pink text-center mb-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          Medical Team
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {medicalTeam.map((m, i) => (
            <motion.div key={`medical-${i}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} transition={{ ...fadeUp.show.transition, delay: (i % 3) * 0.1 }}>
              <TeamMemberCard {...m} />
            </motion.div>
          ))}
        </div>

        {/* Get involved */}
        <motion.div
          className="text-center mb-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-lw-navy mb-2">Get Involved</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Dedicated pages for each of these are coming soon, for now, reach out and we'll point you in the right direction.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {getInvolved.map((g, i) => (
            <motion.div
              key={g.title}
              className="relative bg-lw-navy rounded-3xl p-8 text-white text-center flex flex-col items-center overflow-hidden"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ ...fadeUp.show.transition, delay: i * 0.1 }}
            >
              <div className="absolute inset-0 bg-noise pointer-events-none" />
              <g.icon size={28} className="relative z-10 text-lw-pink mb-4" />
              <h3 className="relative z-10 font-bold text-lg mb-2">{g.title}</h3>
              <p className="relative z-10 text-gray-300 text-sm leading-relaxed mb-6 flex-1">{g.desc}</p>
              <Link to="/contact" className="relative z-10 btn-primary text-sm inline-flex items-center gap-2">
                Get in Touch <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
