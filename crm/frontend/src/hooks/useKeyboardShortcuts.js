import { useEffect, useRef } from 'react'

export default function useKeyboardShortcuts({ onSearchOpen, onHelpOpen, navigate }) {
  const pendingG = useRef(false)
  const gTimer = useRef(null)

  useEffect(() => {
    function handleKey(e) {
      const tag = e.target.tagName.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tag)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key

      if (pendingG.current) {
        clearTimeout(gTimer.current)
        pendingG.current = false
        switch (key) {
          case 'h': e.preventDefault(); navigate('/home'); break
          case 'd': e.preventDefault(); navigate('/dashboard'); break
          case 'c': e.preventDefault(); navigate('/clients'); break
          case 'a': e.preventDefault(); navigate('/appointments'); break
          case 't': e.preventDefault(); navigate('/tickets'); break
          case 'r': e.preventDefault(); navigate('/reports'); break
        }
        return
      }

      if (key === 'g') {
        pendingG.current = true
        gTimer.current = setTimeout(() => { pendingG.current = false }, 1500)
        return
      }

      if (key === '/') {
        e.preventDefault()
        onSearchOpen()
        return
      }

      if (key === '?') {
        e.preventDefault()
        onHelpOpen()
        return
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      clearTimeout(gTimer.current)
    }
  }, [onSearchOpen, onHelpOpen, navigate])
}
