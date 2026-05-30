"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface BookmarksContextType {
  bookmarkedIds: Set<string>
  toggleBookmark: (id: string) => void
  isBookmarked: (id: string) => boolean
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined)

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("dirty-paintbrushes-bookmarks")
    if (stored) {
      setBookmarkedIds(new Set(JSON.parse(stored)))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "dirty-paintbrushes-bookmarks",
        JSON.stringify(Array.from(bookmarkedIds))
      )
    }
  }, [bookmarkedIds, isLoaded])

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const isBookmarked = (id: string) => bookmarkedIds.has(id)

  return (
    <BookmarksContext.Provider value={{ bookmarkedIds, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const context = useContext(BookmarksContext)
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarksProvider")
  }
  return context
}
