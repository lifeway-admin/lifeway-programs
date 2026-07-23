import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Handshake, GraduationCap, ArrowRight } from 'lucide-react'
import TeamMemberCard from '../components/TeamMemberCard'
import { fadeUp } from '../lib/animations'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/team'

const GET_INVOLVED_ICONS = [Briefcase, Handshake, GraduationCap]

const BOARD_PHOTOS = ['/images/team/mayelin-lima.jpg', '/images/team/laura-dahne.jpg', '/images/team/timothy-tyler.jpg']
const EXEC_PHOTOS = ['/images/team/mayelin-lima.jpg', '/images/team/jack-hakimian.jpg']
const DIRECTOR_PHOTOS = ['/images/team/german-alfaro.jpg', '/images/team/maria-reyes.jpg', '/images/team/mayelin-lima.jpg', null]
const MEDICAL_PHOTOS = ['/images/team/misael-gonzalez.jpg', null, '/images/team/richard-arevalo.jpg', null, '/images/team/yisel-neyra-fajadro.jpg', null]

function withPhotos(people, photos) {
  return people.map((p, i) => ({ ...p, photo: photos[i] }))
}

export default function Team() {
  const { lang } = useLanguage()
  const t = i18n[lang]

  const boardOfDirectors = withPhotos(t.board, BOARD_PHOTOS)
  const executiveTeam = withPhotos(t.executives, EXEC_PHOTOS)
  const directorTeam = withPhotos(t.directors, DIRECTOR_PHOTOS)
  const medicalTeam = withPhotos(t.medical, MEDICAL_PHOTOS)
  const getInvolved = t.getInvolvedCards.map((g, i) => ({ ...g, icon: GET_INVOLVED_ICONS[i] }))

  return (
    <div>
      {/* Header */}
      <section className="relative bg-lw-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.eyebrow}</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">{t.title}</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            {t.subtitle}
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
          {t.boardOfDirectors}
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
          {t.executiveTeam}
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
          {t.directorTeam}
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
          {t.medicalTeam}
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
          <h2 className="text-2xl md:text-3xl font-bold text-lw-navy mb-2">{t.getInvolved}</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            {t.getInvolvedSub}
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
                {t.getInTouch} <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
