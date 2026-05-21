import { createContext, useContext, useState, useEffect } from 'react'

const RecentlyViewedContext = createContext()

export function RecentlyViewedProvider({ children }) {
  const [recentItems, setRecentItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lw_recent_items') || '[]') } catch { return [] }
  })

  function addRecentItem(item) {
    // item: { type: 'client'|'ticket', id, label, path }
    setRecentItems(prev => {
      const filtered = prev.filter(i => i.path !== item.path)
      const next = [item, ...filtered].slice(0, 5)
      localStorage.setItem('lw_recent_items', JSON.stringify(next))
      return next
    })
  }

  return (
    <RecentlyViewedContext.Provider value={{ recentItems, addRecentItem }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext)
}
