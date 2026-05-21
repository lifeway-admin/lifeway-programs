import { createContext, useContext, useState, useEffect } from 'react'

const DensityContext = createContext()

export function DensityProvider({ children }) {
  const [density, setDensity] = useState(() => localStorage.getItem('lw_density') || 'comfortable')

  useEffect(() => {
    if (density === 'compact') {
      document.documentElement.setAttribute('data-density', 'compact')
    } else {
      document.documentElement.removeAttribute('data-density')
    }
    localStorage.setItem('lw_density', density)
  }, [density])

  function toggleDensity() {
    setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')
  }

  return (
    <DensityContext.Provider value={{ density, toggleDensity }}>
      {children}
    </DensityContext.Provider>
  )
}

export function useDensity() {
  return useContext(DensityContext)
}
