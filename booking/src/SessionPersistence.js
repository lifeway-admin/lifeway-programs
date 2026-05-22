const KEY = 'lw_booking_session'

export function saveSession(state) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
}

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearSession() {
  try { sessionStorage.removeItem(KEY) } catch {}
}
