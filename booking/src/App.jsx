import { useState, useEffect, useRef } from 'react'
import { format, addDays, isSunday, parseISO } from 'date-fns'
import api from './api'
import AddToCalendar from './AddToCalendar'
import ReturnPatientModal from './ReturnPatientModal'
import CancelLookup from './CancelLookup'
import IntakeFormSigner from './IntakeFormSigner'
import { saveSession, loadSession, clearSession } from './SessionPersistence'

// ── Translations ───────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    // Header
    bookAppointment: 'Book Your Appointment',
    tagline: 'Compassionate Care for Our Community',

    // Step indicator
    steps: ['Your Info', 'Service', 'Provider', 'Date & Time', 'Consent'],

    // Step 1 - Info
    yourInfo: 'Your Information',
    yourInfoSub: 'Tell us a bit about yourself to get started.',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    dob: 'Date of Birth',
    insurance: 'Insurance',
    insurancePlaceholder: 'Medicaid, Medicare, None...',
    notes: 'Notes / Reason for Visit',
    notesPlaceholder: 'Share any details that will help us prepare for your visit...',
    continue: 'Continue',
    required: 'Required',
    invalidEmail: 'Invalid email',
    returningPatient: 'Returning patient?',
    prefillInfo: 'Pre-fill my information',

    // Step 2 - Service
    whatCanWeHelp: 'What can we help you with?',
    selectService: "Select the service you're looking for",

    // Step 3 - Provider
    chooseProvider: 'Choose a Provider',
    providersAvailable: 'providers available',
    anyProvider: 'Any Available Provider',
    anyProviderSub: "We'll assign the best available provider for you",

    // Step 4 - Date & Time
    pickDateTime: 'Pick a Date & Time',
    pickDateTimeSub: 'Select a convenient appointment time',
    availableDates: 'Available Dates',
    availableTimes: 'Available Times',
    anyProviderNote: 'You selected "Any available provider". Times shown are general slots — a provider will be assigned at booking.',
    noSlots: 'No slots available for this date.',

    // Step 5 - Consent
    reviewConsent: 'Review & Consent',
    reviewConsentSub: 'Confirm your booking details and sign the required consent forms.',
    bookingSummary: 'Booking Summary',
    name: 'Name',
    service: 'Service',
    provider: 'Provider',
    dateTime: 'Date & Time',
    consentRequired: 'Patient Consent Forms Required',
    consentRequiredSub: 'You must read and sign our consent forms before confirming your appointment.',
    viewSignConsent: 'View & Sign Consent Forms →',
    consentSigned: 'Consent Forms Signed',
    consentSignedBy: 'Signed by:',
    reviewAgain: 'Review again',
    confirmBooking: 'Confirm Booking',
    signConsentFirst: 'Sign consent forms above to continue',
    anyAvailable: 'Any Available',

    // Consent modal
    consentTitle: 'Patient Consent Forms',
    consentSub: 'Please read carefully and scroll to the bottom to sign',
    scrollHint: '↓ Scroll to the bottom to unlock the signature field',
    iAgreeCheck: 'I have read, understood, and agree to all of the above consent forms.',
    signatureLabel: 'Type your full legal name as your electronic signature *',
    signaturePlaceholder: 'Your full name',
    cancel: 'Cancel',
    iAgreeSign: 'I Agree & Sign',

    // Consent headings
    consentHeadings: [
      '1. Consent for Services',
      '2. HIPAA Notice of Privacy Practices',
      '3. Confidentiality and Its Limits',
      '4. Financial Responsibility',
      '5. Cancellation and No-Show Policy',
      '6. Emergency Procedures',
      '7. Telehealth Services',
      '8. Acknowledgment',
    ],

    // Confirmation
    bookingConfirmed: 'Booking Confirmed!',
    bookingConfirmedSub: 'Your appointment has been successfully scheduled.',
    confirmationNumber: 'Confirmation Number',
    toBeAssigned: 'To Be Assigned',
    seeYouSoon: "We'll see you soon! If you need to reschedule, call us or visit",
    bookAnother: 'Book Another Appointment',

    // Return patient modal
    returningTitle: 'Welcome Back',
    returningSub: 'Enter your email to look up your information.',
    emailLabel: 'Email Address',
    lookupBtn: 'Look Up My Info',
    notFound: 'No record found. Please check your email and date of birth.',
    lookupError: 'Could not look up your information. Please try again.',
    dobRequired: 'Please enter your date of birth to verify your identity.',

    // Reminder opt-in
    reminderOptIn: 'Send me a reminder 24 hours before my appointment',

    // Back
    back: 'Back',

    // Cancel lookup
    cancelTitle: 'Manage Your Appointment',
    cancelSub: 'Enter your confirmation number to cancel or reschedule.',
    cancelNotFound: 'No appointment found with that confirmation number.',
    cancelError: 'Could not cancel the appointment. Please call us directly.',
    cancelConfirmed: 'Appointment Cancelled',
    cancelConfirmedSub: "Your appointment has been cancelled. We hope to see you again soon.",
    cancelBtn: 'Cancel This Appointment',
    bookNew: 'Book a New Appointment',
    appointmentFound: 'Appointment Found',
    status: 'Status',
    alreadyCancelled: 'This appointment is already cancelled.',
    needHelp: 'Need help?',

    // Add to calendar
    addToCalendar: 'Add to Calendar',
    googleCal: 'Google Calendar',
    downloadIcs: 'Download .ics',

    // Intake forms
    intakeForms: 'Complete Your Intake Forms',
    intakeFormsNote: 'Sign your intake forms now to save time at your first visit. A receipt will be emailed to you.',
    intakeFormsCta: 'Sign Intake Forms',
    intakeFormsSkip: 'Skip — I\'ll sign in-office',
    intakeFormsDone: 'Intake Forms Complete',
    intakeFormsDoneNote: 'All forms signed. A receipt has been sent to your email.',

    // Spanish notice (not shown in EN mode)
    spanishNotice: null,
  },
  es: {
    // Header
    bookAppointment: 'Reserve su Cita',
    tagline: 'Atención Compasiva para Nuestra Comunidad',

    // Step indicator
    steps: ['Su Información', 'Servicio', 'Proveedor', 'Fecha y Hora', 'Consentimiento'],

    // Step 1
    yourInfo: 'Su Información',
    yourInfoSub: 'Cuéntenos un poco sobre usted para comenzar.',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    dob: 'Fecha de Nacimiento',
    insurance: 'Seguro Médico',
    insurancePlaceholder: 'Medicaid, Medicare, Ninguno...',
    notes: 'Notas / Motivo de la Visita',
    notesPlaceholder: 'Comparta cualquier detalle que nos ayude a prepararnos para su visita...',
    continue: 'Continuar',
    required: 'Requerido',
    invalidEmail: 'Correo inválido',
    returningPatient: '¿Ya es paciente?',
    prefillInfo: 'Completar mi información',

    // Step 2
    whatCanWeHelp: '¿En qué podemos ayudarle?',
    selectService: 'Seleccione el servicio que está buscando',

    // Step 3
    chooseProvider: 'Elija un Proveedor',
    providersAvailable: 'proveedores disponibles',
    anyProvider: 'Cualquier Proveedor Disponible',
    anyProviderSub: 'Asignaremos el mejor proveedor disponible para usted',

    // Step 4
    pickDateTime: 'Elija Fecha y Hora',
    pickDateTimeSub: 'Seleccione un horario conveniente para su cita',
    availableDates: 'Fechas Disponibles',
    availableTimes: 'Horarios Disponibles',
    anyProviderNote: 'Seleccionó "Cualquier proveedor disponible". Los horarios mostrados son generales — se le asignará un proveedor al confirmar.',
    noSlots: 'No hay horarios disponibles para esta fecha.',

    // Step 5
    reviewConsent: 'Revisión y Consentimiento',
    reviewConsentSub: 'Confirme los detalles de su cita y firme los formularios de consentimiento requeridos.',
    bookingSummary: 'Resumen de su Cita',
    name: 'Nombre',
    service: 'Servicio',
    provider: 'Proveedor',
    dateTime: 'Fecha y Hora',
    consentRequired: 'Formularios de Consentimiento Requeridos',
    consentRequiredSub: 'Debe leer y firmar nuestros formularios de consentimiento antes de confirmar su cita.',
    viewSignConsent: 'Ver y Firmar Formularios →',
    consentSigned: 'Formularios Firmados',
    consentSignedBy: 'Firmado por:',
    reviewAgain: 'Revisar de nuevo',
    confirmBooking: 'Confirmar Cita',
    signConsentFirst: 'Firme los formularios de consentimiento para continuar',
    anyAvailable: 'Cualquier Disponible',

    // Consent modal
    consentTitle: 'Formularios de Consentimiento del Paciente',
    consentSub: 'Por favor lea con cuidado y desplácese hasta el final para firmar',
    scrollHint: '↓ Desplácese hasta el final para habilitar el campo de firma',
    iAgreeCheck: 'He leído, entendido y acepto todos los formularios de consentimiento anteriores.',
    signatureLabel: 'Escriba su nombre legal completo como firma electrónica *',
    signaturePlaceholder: 'Su nombre completo',
    cancel: 'Cancelar',
    iAgreeSign: 'Acepto y Firmo',

    // Consent headings
    consentHeadings: [
      '1. Consentimiento para Servicios',
      '2. Aviso de Privacidad HIPAA',
      '3. Confidencialidad y sus Límites',
      '4. Responsabilidad Financiera',
      '5. Política de Cancelación y Ausencias',
      '6. Procedimientos de Emergencia',
      '7. Servicios de Telesalud',
      '8. Reconocimiento',
    ],

    // Confirmation
    bookingConfirmed: '¡Cita Confirmada!',
    bookingConfirmedSub: 'Su cita ha sido programada exitosamente.',
    confirmationNumber: 'Número de Confirmación',
    toBeAssigned: 'Por Asignar',
    seeYouSoon: '¡Hasta pronto! Si necesita reprogramar, llámenos o visítenos en',
    bookAnother: 'Reservar Otra Cita',

    // Return patient
    returningTitle: 'Bienvenido de Nuevo',
    returningSub: 'Ingrese su correo electrónico para buscar su información.',
    emailLabel: 'Correo Electrónico',
    lookupBtn: 'Buscar Mi Información',
    notFound: 'No se encontró ningún registro. Por favor verifique su correo y fecha de nacimiento.',
    lookupError: 'No se pudo encontrar su información. Por favor intente de nuevo.',
    dobRequired: 'Por favor ingrese su fecha de nacimiento para verificar su identidad.',

    // Reminder
    reminderOptIn: 'Enviarme un recordatorio 24 horas antes de mi cita',

    // Back
    back: 'Atrás',

    // Cancel lookup
    cancelTitle: 'Administrar su Cita',
    cancelSub: 'Ingrese su número de confirmación para cancelar o reprogramar.',
    cancelNotFound: 'No se encontró ninguna cita con ese número de confirmación.',
    cancelError: 'No se pudo cancelar la cita. Por favor llámenos directamente.',
    cancelConfirmed: 'Cita Cancelada',
    cancelConfirmedSub: 'Su cita ha sido cancelada. Esperamos verle pronto.',
    cancelBtn: 'Cancelar Esta Cita',
    bookNew: 'Reservar una Nueva Cita',
    appointmentFound: 'Cita Encontrada',
    status: 'Estado',
    alreadyCancelled: 'Esta cita ya está cancelada.',
    needHelp: '¿Necesita ayuda?',

    // Add to calendar
    addToCalendar: 'Agregar al Calendario',
    googleCal: 'Google Calendar',
    downloadIcs: 'Descargar .ics',

    // Intake forms
    intakeForms: 'Complete sus Formularios de Ingreso',
    intakeFormsNote: 'Firme sus formularios ahora para ahorrar tiempo en su primera visita. Recibirá un comprobante por correo electrónico.',
    intakeFormsCta: 'Firmar Formularios',
    intakeFormsSkip: 'Omitir — Firmaré en la oficina',
    intakeFormsDone: 'Formularios Completados',
    intakeFormsDoneNote: 'Todos los formularios firmados. Se ha enviado un comprobante a su correo.',

    // Spanish notice shown at top of consent modal body
    spanishNotice: 'Nota: Este formulario está disponible en español. El contenido legal a continuación está en inglés. Para una traducción completa, comuníquese con nuestra oficina.',
  },
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function HeartIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="w-20 h-20 text-lifeway-pink mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

// ── Service icon mapper ────────────────────────────────────────────────────────

const SERVICE_EMOJIS = {
  brain: '🧠', 'heart-pulse': '💊', users: '🤝',
  sun: '🌟', briefcase: '💼', apple: '🍎', activity: '✨',
}

// ── Language Toggle ────────────────────────────────────────────────────────────

function LangToggle({ lang, setLang }) {
  return (
    <div className="ml-auto flex items-center">
      <div className="flex rounded-full overflow-hidden border-2 border-white/40 text-sm font-bold">
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-1 transition-colors ${lang === 'en' ? 'bg-white text-lifeway-pink' : 'bg-transparent text-white hover:bg-white/20'}`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('es')}
          className={`px-3 py-1 transition-colors ${lang === 'es' ? 'bg-white text-lifeway-pink' : 'bg-transparent text-white hover:bg-white/20'}`}
        >
          ES
        </button>
      </div>
    </div>
  )
}

// ── Step Indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ currentStep, t }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {t.steps.map((label, idx) => {
        const stepNum = idx + 1
        const isCompleted = currentStep > stepNum
        const isCurrent = currentStep === stepNum
        return (
          <div key={stepNum} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                ${isCompleted ? 'bg-lifeway-pink border-lifeway-pink text-white' : ''}
                ${isCurrent ? 'bg-white border-lifeway-pink text-lifeway-pink' : ''}
                ${!isCompleted && !isCurrent ? 'bg-white border-gray-300 text-gray-400' : ''}
              `}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : stepNum}
              </div>
              <span className={`text-xs mt-1 font-medium hidden sm:block ${isCurrent ? 'text-lifeway-pink' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {idx < t.steps.length - 1 && (
              <div className={`h-0.5 w-10 sm:w-14 mx-1 mt-0 sm:-mt-4 transition-all ${isCompleted ? 'bg-lifeway-pink' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1: Personal Information ───────────────────────────────────────────────

function InfoStep({ onNext, t }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    date_of_birth: '', insurance: '', notes: '', remind_me: false,
  })
  const [errors, setErrors] = useState({})
  const [showReturnModal, setShowReturnModal] = useState(false)

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = t.required
    if (!form.last_name.trim()) e.last_name = t.required
    if (!form.email.trim()) e.email = t.required
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.invalidEmail
    if (!form.phone.trim()) e.phone = t.required
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (validate()) onNext(form)
  }

  const inputClass = (field) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lifeway-pink focus:border-transparent transition-all
    ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`

  return (
    <form onSubmit={handleNext} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.yourInfo}</h2>
        <p className="text-gray-500 text-sm">{t.yourInfoSub}</p>
        <button
          type="button"
          onClick={() => setShowReturnModal(true)}
          className="mt-2 text-sm text-lifeway-pink font-medium hover:underline text-left"
        >
          {t.returningPatient} {t.prefillInfo} →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t.firstName} *</label>
          <input className={inputClass('first_name')} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Jane" />
          {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t.lastName} *</label>
          <input className={inputClass('last_name')} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Doe" />
          {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t.email} *</label>
          <input type="email" className={inputClass('email')} value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t.phone} *</label>
          <input type="tel" className={inputClass('phone')} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="305-555-1234" />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t.dob}</label>
          <input type="date" className={inputClass('date_of_birth')} value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t.insurance}</label>
          <input className={inputClass('insurance')} value={form.insurance} onChange={e => set('insurance', e.target.value)} placeholder={t.insurancePlaceholder} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">{t.notes}</label>
        <textarea
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lifeway-pink focus:border-transparent resize-none"
          rows={3}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder={t.notesPlaceholder}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={form.remind_me}
          onChange={e => set('remind_me', e.target.checked)}
          className="rounded border-gray-300 text-lifeway-pink focus:ring-lifeway-pink"
        />
        {t.reminderOptIn}
      </label>

      <button
        type="submit"
        className="w-full py-3 bg-lifeway-pink hover:bg-lifeway-darkpink text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {t.continue}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {showReturnModal && (
        <ReturnPatientModal
          onFound={(data) => { setForm(f => ({ ...f, ...data })); setShowReturnModal(false) }}
          onClose={() => setShowReturnModal(false)}
          t={t}
        />
      )}
    </form>
  )
}

// ── Step 2: Choose Service ─────────────────────────────────────────────────────

function ServiceStep({ services, onSelect, t }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t.whatCanWeHelp}</h2>
      <p className="text-gray-500 text-center mb-8">{t.selectService}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {services.map((svc) => (
          <button
            key={svc.id}
            onClick={() => onSelect(svc)}
            className="flex flex-col items-center p-5 rounded-xl border-2 border-gray-200 hover:border-lifeway-pink hover:shadow-md cursor-pointer transition-all bg-white text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-lifeway-light flex items-center justify-center text-2xl mb-3 group-hover:bg-lifeway-pink group-hover:text-white transition-colors">
              {SERVICE_EMOJIS[svc.icon] || '✦'}
            </div>
            <span className="font-semibold text-gray-900 text-sm text-center">{svc.label}</span>
            <span className="text-xs text-gray-500 text-center mt-1 leading-snug">{svc.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 3: Choose Provider ────────────────────────────────────────────────────

function ProviderStep({ providers, selectedService, onSelect, t }) {
  const colors = ['bg-pink-100 text-pink-700', 'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700']
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t.chooseProvider}</h2>
      <p className="text-gray-500 text-center mb-8">{selectedService?.label} {t.providersAvailable}</p>
      <div className="space-y-3">
        <button
          onClick={() => onSelect(null)}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-lifeway-pink hover:shadow-md cursor-pointer transition-all bg-white"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold flex-shrink-0">?</div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">{t.anyProvider}</div>
            <div className="text-sm text-gray-500">{t.anyProviderSub}</div>
          </div>
        </button>
        {providers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No specific providers found for this service.</p>
            <p className="text-sm mt-1">Please select "{t.anyProvider}".</p>
          </div>
        )}
        {providers.map((p, idx) => {
          const initials = `${p.first_name[0]}${p.last_name[0]}`.toUpperCase()
          const colorClass = colors[idx % colors.length]
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-lifeway-pink hover:shadow-md cursor-pointer transition-all bg-white"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${colorClass}`}>{initials}</div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">{p.title ? `${p.title} ` : ''}{p.first_name} {p.last_name}</div>
                <div className="text-xs text-lifeway-pink font-medium capitalize">{p.role.replace('_', ' ')}</div>
                {p.bio && <div className="text-sm text-gray-500 mt-1 line-clamp-2">{p.bio}</div>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 4: Choose Date & Time ─────────────────────────────────────────────────

function DateTimeStep({ selectedProvider, onSelect, t }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isTelehealth, setIsTelehealth] = useState(false)

  const today = new Date()
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i)).filter(d => !isSunday(d))

  const handleDateSelect = async (d) => {
    setSelectedDate(d)
    setSlots([])
    if (!selectedProvider) return
    setLoadingSlots(true)
    try {
      const dateStr = format(d, 'yyyy-MM-dd')
      const resp = await api.get(`/public/slots?staff_id=${selectedProvider.id}&date=${dateStr}`)
      setSlots(resp.data)
    } catch {}
    finally { setLoadingSlots(false) }
  }

  const handleSlotSelect = (slot) => {
    if (!slot.available) return
    onSelect({ date: selectedDate, slot, isTelehealth })
  }

  const formatSlotTime = (timeStr) => {
    const [h] = timeStr.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:00 ${ampm}`
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t.pickDateTime}</h2>
      <p className="text-gray-500 text-center mb-6">{t.pickDateTimeSub}</p>

      {/* Virtual / In-Person toggle */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-6">
        <button
          onClick={() => setIsTelehealth(false)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2
            ${!isTelehealth ? 'bg-lifeway-pink text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          In-Person
        </button>
        <button
          onClick={() => setIsTelehealth(true)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2
            ${isTelehealth ? 'bg-lifeway-pink text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Virtual (Telehealth)
        </button>
      </div>
      {isTelehealth && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          A Zoom meeting link will be emailed and texted to you after booking.
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{t.availableDates}</h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {dates.map((d) => {
            const isSelected = selectedDate && format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            return (
              <button
                key={d.toISOString()}
                onClick={() => handleDateSelect(d)}
                className={`flex flex-col items-center py-2.5 px-1 rounded-lg border-2 transition-all cursor-pointer
                  ${isSelected ? 'bg-lifeway-pink border-lifeway-pink text-white' : 'border-gray-200 hover:border-lifeway-pink text-gray-700 bg-white'}`}
              >
                <span className="text-xs font-medium">{format(d, 'EEE')}</span>
                <span className="text-lg font-bold">{format(d, 'd')}</span>
                <span className="text-xs">{format(d, 'MMM')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {t.availableTimes} — {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          {!selectedProvider && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-3">
              {t.anyProviderNote}
            </p>
          )}
          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lifeway-pink" />
            </div>
          ) : selectedProvider && slots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                  className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all
                    ${slot.available
                      ? 'border-gray-200 hover:border-lifeway-pink hover:bg-lifeway-light text-gray-800 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'}`}
                >
                  {formatSlotTime(slot.time)}
                </button>
              ))}
            </div>
          ) : selectedProvider ? (
            <p className="text-center text-gray-400 py-6">{t.noSlots}</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: 9 }, (_, i) => {
                const hour = 8 + i
                const ampm = hour >= 12 ? 'PM' : 'AM'
                const displayHour = hour > 12 ? hour - 12 : hour
                const timeStr = `${String(hour).padStart(2, '0')}:00`
                const datetimeStr = `${format(selectedDate, 'yyyy-MM-dd')}T${timeStr}:00`
                return (
                  <button
                    key={timeStr}
                    onClick={() => onSelect({ date: selectedDate, slot: { time: timeStr, datetime: datetimeStr, available: true } })}
                    className="py-2.5 px-3 rounded-lg border-2 border-gray-200 hover:border-lifeway-pink hover:bg-lifeway-light text-sm font-medium text-gray-800 cursor-pointer transition-all"
                  >
                    {displayHour}:00 {ampm}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Consent Modal ──────────────────────────────────────────────────────────────

function ConsentModal({ onSign, onClose, t, lang }) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signature, setSignature] = useState('')
  const bodyRef = useRef(null)

  function handleScroll() {
    const el = bodyRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setScrolledToBottom(true)
    }
  }

  const canSign = scrolledToBottom && agreed && signature.trim().length >= 2

  const h = t.consentHeadings

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.consentTitle}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t.consentSub}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Scroll progress hint */}
        {!scrolledToBottom && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex-shrink-0">
            <p className="text-xs text-amber-700 font-medium">{t.scrollHint}</p>
          </div>
        )}

        {/* Consent body */}
        <div
          ref={bodyRef}
          onScroll={handleScroll}
          className="overflow-y-auto flex-1 px-6 py-5 text-sm text-gray-700 space-y-5 leading-relaxed"
        >
          {/* Spanish language notice */}
          {lang === 'es' && t.spanishNotice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium">{t.spanishNotice}</p>
            </div>
          )}

          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{h[0]}</h3>
            <p>By completing this booking, I voluntarily request and consent to receive services from Lifeway Programs, Inc., a nonprofit mental health and community wellness organization. I understand that services may include individual counseling, family therapy, group therapy, case management, psychiatric evaluation, substance abuse counseling, and other related support services as recommended by my assigned provider.</p>
            <p className="mt-2">I understand that my participation in services is voluntary and that I may withdraw my consent at any time. I acknowledge that no specific outcomes can be guaranteed, and that treatment goals will be discussed and agreed upon with my provider.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{h[1]}</h3>
            <p>Lifeway Programs is committed to protecting the privacy of your health information in compliance with the Health Insurance Portability and Accountability Act (HIPAA). Your protected health information (PHI) may be used and disclosed for the purposes of treatment, payment, and healthcare operations without additional authorization.</p>
            <p className="mt-2">Lifeway Programs will not sell, rent, or share your personal health information with third parties for marketing purposes. Disclosures outside of treatment, payment, and operations will require your written authorization, except as permitted or required by law, including but not limited to:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Mandatory reporting of suspected child abuse, elder abuse, or abuse of a dependent adult</li>
              <li>Situations involving imminent risk of harm to yourself or others</li>
              <li>Valid court orders or legal subpoenas</li>
              <li>Public health reporting as required by state or federal law</li>
            </ul>
            <p className="mt-2">You have the right to access your records, request corrections, receive an accounting of disclosures, and obtain a paper copy of our full Notice of Privacy Practices at any time by contacting our office.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{h[2]}</h3>
            <p>Information shared during your sessions is confidential. Your provider will not disclose information to outside parties without your written consent except in the following circumstances:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><strong>Risk of harm:</strong> If you disclose intent to harm yourself or another person, your provider is legally and ethically required to take protective action, which may include notifying emergency services or appropriate individuals.</li>
              <li><strong>Abuse or neglect:</strong> Providers are mandated reporters and must report known or suspected abuse or neglect of a minor, elderly person, or vulnerable adult to the appropriate authorities.</li>
              <li><strong>Legal proceedings:</strong> If you are involved in a court proceeding and the court orders disclosure, your provider may be required to provide records or testimony.</li>
              <li><strong>Supervision and consultation:</strong> Your provider may consult with clinical supervisors or colleagues for the purpose of quality care. These consultations are conducted confidentially.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{h[3]}</h3>
            <p>I understand that I am responsible for any fees associated with services received at Lifeway Programs. Lifeway Programs offers services on a sliding-scale fee basis based on household income and family size. I agree to discuss payment arrangements, sliding-scale eligibility, and insurance billing with administrative staff prior to or at my first appointment.</p>
            <p className="mt-2">I understand that failure to address outstanding balances may affect my ability to schedule future appointments. Lifeway Programs accepts Medicaid, Medicare, and select private insurance plans. Uninsured individuals may qualify for reduced-fee services through our community assistance fund.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{h[4]}</h3>
            <p>I understand that my scheduled appointment time is reserved specifically for me. If I am unable to attend, I agree to notify Lifeway Programs at least <strong>24 hours in advance</strong> so that the time may be offered to another person in need of services.</p>
            <p className="mt-2">Repeated cancellations without adequate notice or habitual no-shows may result in a temporary hold on scheduling or a requirement to re-engage through the intake process. We understand emergencies happen and will work with clients on a case-by-case basis.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{h[5]}</h3>
            <p>In the event of a psychiatric or medical emergency during a session or on the premises, Lifeway Programs staff are authorized to contact emergency services (911) on your behalf. I authorize Lifeway Programs to contact my designated emergency contact in the event of a safety concern or medical emergency where I am unable to communicate on my own behalf.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{h[6]}</h3>
            <p>If your services are delivered via telehealth (video or phone), you consent to receive services in this format and understand that telehealth is not appropriate for all clinical situations. Your provider will use HIPAA-compliant technology platforms. You agree to participate from a private, secure location and to notify your provider if a third party is present during the session.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 text-base mb-2">{h[7]}</h3>
            <p>I confirm that I have read and understood the above consent forms, or that they have been explained to me in a language I understand. I have had the opportunity to ask questions. By signing below, I voluntarily agree to the terms outlined in this document and authorize Lifeway Programs to provide the services described.</p>
            <p className="mt-2 text-xs text-gray-500">This consent remains in effect for the duration of my services at Lifeway Programs unless revoked in writing. A copy of this consent is available upon request.</p>
          </section>
        </div>

        {/* Signature area */}
        <div className="border-t border-gray-200 px-6 py-4 space-y-3 flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <label className={`flex items-start gap-3 cursor-pointer ${!scrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-lifeway-pink focus:ring-lifeway-pink"
            />
            <span className="text-sm text-gray-700 leading-snug">
              {t.iAgreeCheck}
            </span>
          </label>

          <div className={!scrolledToBottom ? 'opacity-40 pointer-events-none' : ''}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t.signatureLabel}
            </label>
            <input
              type="text"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              placeholder={t.signaturePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lifeway-pink font-medium italic"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              disabled={!canSign}
              onClick={() => onSign(signature.trim())}
              className="flex-1 py-2.5 bg-lifeway-pink text-white font-semibold rounded-lg text-sm hover:bg-lifeway-darkpink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t.iAgreeSign}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step 5: Review & Consent ───────────────────────────────────────────────────

function ConsentStep({ form, selectedService, selectedProvider, selectedSlot, onConfirm, loading, t, lang }) {
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [consentSignature, setConsentSignature] = useState(null)

  const formatDateTime = (slot) => {
    if (!slot) return ''
    try { return format(parseISO(slot.slot.datetime), "EEEE, MMMM d, yyyy 'at' h:mm a") }
    catch { return slot.slot.datetime }
  }

  function handleSign(signature) {
    setConsentSignature(signature)
    setShowConsentModal(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.reviewConsent}</h2>
        <p className="text-gray-500 text-sm">{t.reviewConsentSub}</p>
      </div>

      {/* Booking summary */}
      <div className="bg-lifeway-light border border-pink-100 rounded-xl p-5">
        <h3 className="font-semibold text-lifeway-darkpink mb-4 text-sm uppercase tracking-wide">{t.bookingSummary}</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{t.name}</span>
            <span className="font-semibold text-gray-900">{form.first_name} {form.last_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t.email}</span>
            <span className="font-semibold text-gray-900">{form.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t.phone}</span>
            <span className="font-semibold text-gray-900">{form.phone}</span>
          </div>
          {selectedService && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t.service}</span>
              <span className="font-semibold text-gray-900">{selectedService.label}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">{t.provider}</span>
            <span className="font-semibold text-gray-900">
              {selectedProvider
                ? `${selectedProvider.title ? selectedProvider.title + ' ' : ''}${selectedProvider.first_name} ${selectedProvider.last_name}`
                : t.anyAvailable}
            </span>
          </div>
          {selectedSlot && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t.dateTime}</span>
              <span className="font-semibold text-gray-900 text-right ml-4">{formatDateTime(selectedSlot)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Consent section */}
      <div className={`rounded-xl border-2 p-5 transition-all ${consentSignature ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${consentSignature ? 'bg-green-100' : 'bg-gray-100'}`}>
            {consentSignature ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            {consentSignature ? (
              <div>
                <p className="font-semibold text-green-800 text-sm">{t.consentSigned}</p>
                <p className="text-xs text-green-700 mt-0.5">{t.consentSignedBy} <span className="italic font-medium">{consentSignature}</span></p>
                <button
                  onClick={() => setShowConsentModal(true)}
                  className="text-xs text-green-700 underline mt-1 hover:text-green-900"
                >
                  {t.reviewAgain}
                </button>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.consentRequired}</p>
                <p className="text-xs text-gray-500 mt-0.5 mb-3">{t.consentRequiredSub}</p>
                <button
                  onClick={() => setShowConsentModal(true)}
                  className="px-4 py-2 bg-lifeway-pink text-white text-sm font-semibold rounded-lg hover:bg-lifeway-darkpink transition-colors"
                >
                  {t.viewSignConsent}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        disabled={!consentSignature || loading}
        className="w-full py-3.5 bg-lifeway-pink hover:bg-lifeway-darkpink text-white font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Confirming...
          </>
        ) : (
          <>
            {!consentSignature && <span className="text-xs opacity-80">{t.signConsentFirst}</span>}
            {consentSignature && t.confirmBooking}
          </>
        )}
      </button>

      {showConsentModal && (
        <ConsentModal onSign={handleSign} onClose={() => setShowConsentModal(false)} t={t} lang={lang} />
      )}
    </div>
  )
}

// ── Step 6: Confirmation ───────────────────────────────────────────────────────

function DonateCard() {
  const [amount, setAmount] = useState(25)
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const PRESETS = [10, 25, 50, 100]
  const finalAmount = custom ? parseInt(custom) : amount

  async function checkout() {
    if (!finalAmount || finalAmount < 1) return
    setLoading(true)
    try {
      const { data } = await api.post('/public/donate/checkout', {
        amount_cents: finalAmount * 100,
        donor_name: name || null,
        donor_email: email || null,
        campaign: 'general',
      })
      window.location.href = data.checkout_url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="my-4 p-4 bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-xl text-left">
      <p className="font-semibold text-pink-900 text-sm mb-1">Support Lifeway Programs</p>
      <p className="text-xs text-pink-700 mb-3">Help us continue providing compassionate care to our community.</p>
      <div className="flex gap-2 mb-3 flex-wrap">
        {PRESETS.map(p => (
          <button key={p} onClick={() => { setAmount(p); setCustom('') }}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors
              ${!custom && amount === p ? 'bg-lifeway-pink text-white border-lifeway-pink' : 'bg-white text-gray-700 border-gray-200 hover:border-pink-400'}`}>
            ${p}
          </button>
        ))}
        <input
          type="number" min="1" placeholder="Other"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <input className="input text-xs" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} />
        <input className="input text-xs" type="email" placeholder="Email for receipt" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <button onClick={checkout} disabled={loading || !finalAmount || finalAmount < 1}
        className="w-full py-2 bg-lifeway-pink hover:bg-lifeway-darkpink text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
        {loading ? 'Redirecting…' : `Donate $${finalAmount || '—'} via Stripe →`}
      </button>
    </div>
  )
}

function ConfirmationStep({ confirmation, selectedService, selectedProvider, selectedSlot, form, onReset, t }) {
  const [showSigner, setShowSigner] = useState(false)
  const [formsSigned, setFormsSigned] = useState(false)

  const formatDateTime = (slot) => {
    if (!slot) return ''
    try { return format(parseISO(slot.slot.datetime), "EEEE, MMMM d, yyyy 'at' h:mm a") }
    catch { return slot.slot.datetime }
  }

  const providerLabel = selectedProvider
    ? `${selectedProvider.title ? selectedProvider.title + ' ' : ''}${selectedProvider.first_name} ${selectedProvider.last_name}`
    : t.toBeAssigned

  return (
    <div className="text-center max-w-lg mx-auto">
      <div className="mb-6"><CheckCircleIcon /></div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.bookingConfirmed}</h2>
      <p className="text-gray-500 mb-6">{t.bookingConfirmedSub}</p>

      <div className="bg-lifeway-light border border-pink-200 rounded-xl p-5 mb-6 text-left">
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t.confirmationNumber}</p>
          <p className="text-2xl font-bold text-lifeway-pink tracking-widest mt-1">{confirmation?.confirmation_number}</p>
        </div>
        <hr className="border-pink-200 mb-4" />
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{t.name}</span>
            <span className="font-semibold text-gray-900">{form.first_name} {form.last_name}</span>
          </div>
          {selectedService && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t.service}</span>
              <span className="font-semibold text-gray-900">{selectedService.label}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">{t.provider}</span>
            <span className="font-semibold text-gray-900">{providerLabel}</span>
          </div>
          {selectedSlot && (
            <div className="flex justify-between">
              <span className="text-gray-500">{t.dateTime}</span>
              <span className="font-semibold text-gray-900 text-right ml-4">{formatDateTime(selectedSlot)}</span>
            </div>
          )}
        </div>
      </div>

      <AddToCalendar
        datetime={selectedSlot?.slot?.datetime}
        service={selectedService?.label}
        provider={providerLabel}
        confirmationNumber={confirmation?.confirmation_number}
        t={t}
      />

      {/* Zoom link (telehealth) */}
      {confirmation?.zoom_join_url && (
        <div className="my-4 p-4 bg-green-50 border border-green-200 rounded-xl text-left">
          <p className="font-semibold text-green-800 text-sm mb-1">Telehealth Appointment</p>
          <p className="text-xs text-green-700 mb-3">Join your session using the link below. This link was also sent to your email and phone.</p>
          <a
            href={confirmation.zoom_join_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Join Zoom Meeting
          </a>
          <p className="text-xs text-gray-400 mt-2 break-all">{confirmation.zoom_join_url}</p>
        </div>
      )}

      {/* Intake forms section */}
      {formsSigned ? (
        <div className="my-4 p-4 bg-green-50 border border-green-200 rounded-xl text-left flex items-start gap-3">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-green-800 text-sm">{t.intakeFormsDone}</p>
            <p className="text-xs text-green-700 mt-0.5">{t.intakeFormsDoneNote}</p>
          </div>
        </div>
      ) : (
        <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left">
          <p className="font-semibold text-blue-900 text-sm mb-1">{t.intakeForms}</p>
          <p className="text-xs text-blue-700 mb-3">{t.intakeFormsNote}</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowSigner(true)}
              className="px-4 py-2 bg-lifeway-pink text-white text-sm font-semibold rounded-lg hover:bg-lifeway-darkpink transition-colors"
            >
              {t.intakeFormsCta}
            </button>
            <button
              onClick={() => setFormsSigned(true)}
              className="px-4 py-2 border border-blue-300 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              {t.intakeFormsSkip}
            </button>
          </div>
        </div>
      )}

      <DonateCard />

      <p className="text-sm text-gray-500 mb-6">
        {t.seeYouSoon}{' '}
        <a href="https://lifewayprograms.org" className="text-lifeway-pink font-medium hover:underline" target="_blank" rel="noreferrer">
          lifewayprograms.org
        </a>
      </p>

      <button
        onClick={onReset}
        className="w-full py-3 bg-lifeway-pink hover:bg-lifeway-darkpink text-white font-semibold rounded-lg transition-colors"
      >
        {t.bookAnother}
      </button>

      {showSigner && (
        <IntakeFormSigner
          clientId={confirmation?.client_id}
          appointmentId={confirmation?.appointment_id}
          patientEmail={form.email}
          patientName={`${form.first_name} ${form.last_name}`}
          onComplete={() => { setShowSigner(false); setFormsSigned(true) }}
          onSkip={() => { setShowSigner(false); setFormsSigned(true) }}
        />
      )}
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────────

export default function App() {
  const isCancelPage = window.location.pathname === '/cancel'
  const [lang, setLang] = useState(() => sessionStorage.getItem('lw_lang') || 'en')
  const t = TRANSLATIONS[lang]

  function handleSetLang(l) {
    setLang(l)
    sessionStorage.setItem('lw_lang', l)
  }

  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [providers, setProviders] = useState([])
  const [bookingForm, setBookingForm] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/public/services').then(r => setServices(r.data)).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedService) {
      api.get(`/public/providers?service=${selectedService.id}`)
        .then(r => setProviders(r.data))
        .catch(console.error)
    }
  }, [selectedService])

  // Restore session on mount
  useEffect(() => {
    const saved = loadSession()
    if (saved && saved.step && saved.step < 6) {
      if (saved.bookingForm) setBookingForm(saved.bookingForm)
      if (saved.selectedService) setSelectedService(saved.selectedService)
      if (saved.selectedProvider !== undefined) setSelectedProvider(saved.selectedProvider)
      if (saved.selectedSlot) setSelectedSlot(saved.selectedSlot)
      setStep(saved.step)
    }
  }, [])

  // Save session on state changes
  useEffect(() => {
    if (step > 1 && step < 6) {
      saveSession({ step, bookingForm, selectedService, selectedProvider, selectedSlot })
    }
    if (step === 6 || step === 1) {
      clearSession()
    }
  }, [step, bookingForm, selectedService, selectedProvider, selectedSlot])

  // Step 1 → 2
  const handleInfoNext = (form) => {
    setBookingForm(form)
    setStep(2)
  }

  // Step 2 → 3
  const handleServiceSelect = (svc) => {
    setSelectedService(svc)
    setSelectedProvider(null)
    setSelectedSlot(null)
    setStep(3)
  }

  // Step 3 → 4
  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider)
    setSelectedSlot(null)
    setStep(4)
  }

  // Step 4 → 5
  const handleSlotSelect = ({ date, slot, isTelehealth }) => {
    setSelectedSlot({ date, slot, isTelehealth: isTelehealth || false })
    setStep(5)
  }

  // Step 5 → 6 (actual booking)
  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        first_name: bookingForm.first_name,
        last_name: bookingForm.last_name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        date_of_birth: bookingForm.date_of_birth || null,
        insurance: bookingForm.insurance || null,
        service: selectedService?.id,
        staff_id: selectedProvider?.id || null,
        appointment_datetime: selectedSlot?.slot?.datetime,
        notes: bookingForm.notes || null,
        is_telehealth: selectedSlot?.isTelehealth || false,
      }
      const resp = await api.post('/public/book', payload)
      setConfirmation(resp.data)
      setStep(6)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    clearSession()
    setStep(1)
    setBookingForm(null)
    setSelectedService(null)
    setSelectedProvider(null)
    setSelectedSlot(null)
    setConfirmation(null)
    setError(null)
  }

  const handleBack = () => {
    if (step > 1 && step < 6) setStep(s => s - 1)
  }

  if (isCancelPage) return <CancelLookup t={t} />

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-lifeway-pink shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <HeartIcon />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-none">Lifeway Programs</h1>
            <p className="text-pink-100 text-sm mt-0.5">{t.bookAppointment}</p>
          </div>
          <LangToggle lang={lang} setLang={handleSetLang} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {step < 6 && (
          <div className="mb-6">
            <StepIndicator currentStep={step} t={t} />
          </div>
        )}

        {step > 1 && step < 6 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-gray-500 hover:text-lifeway-pink mb-4 text-sm font-medium transition-colors"
          >
            <ChevronLeftIcon />
            {t.back}
          </button>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {step === 1 && <InfoStep onNext={handleInfoNext} t={t} />}
          {step === 2 && <ServiceStep services={services} onSelect={handleServiceSelect} t={t} />}
          {step === 3 && <ProviderStep providers={providers} selectedService={selectedService} onSelect={handleProviderSelect} t={t} />}
          {step === 4 && <DateTimeStep selectedProvider={selectedProvider} onSelect={handleSlotSelect} t={t} />}
          {step === 5 && (
            <ConsentStep
              form={bookingForm}
              selectedService={selectedService}
              selectedProvider={selectedProvider}
              selectedSlot={selectedSlot}
              onConfirm={handleConfirm}
              loading={loading}
              t={t}
              lang={lang}
            />
          )}
          {step === 6 && (
            <ConfirmationStep
              confirmation={confirmation}
              selectedService={selectedService}
              selectedProvider={selectedProvider}
              selectedSlot={selectedSlot}
              form={bookingForm}
              onReset={handleReset}
              t={t}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Lifeway Programs · {t.tagline}
        </p>
      </main>
    </div>
  )
}
