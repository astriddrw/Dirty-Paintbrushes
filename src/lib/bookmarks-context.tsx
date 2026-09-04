"use client"

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { LoginPromptModal } from "@/components/login-prompt-modal"

interface BookmarksContextType {
  bookmarkedIds: Set<string>
  toggleBookmark: (id: string) => void
  isBookmarked: (id: string) => boolean
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined)

const STORAGE_KEY = "dirty-paintbrushes-bookmarks"

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [isLoaded, setIsLoaded] = useState(false)
  // Guards the local->account migration so it only runs once per mount even
  // though the effect below re-fires if `user` reference changes.
  const migratedRef = useRef(false)
  // Non-null shows the login prompt modal and carries the page to return to
  // after logging in — see toggleBookmark below.
  const [loginPromptNext, setLoginPromptNext] = useState<string | null>(null)

  // Logged out: still reads any bookmarks saved locally before this gate
  // existed, so nobody's pre-existing saves disappear — but toggleBookmark
  // below no longer writes new ones here. Saving now requires an account,
  // so a local-only save can never become the *only* copy of it again.
  useEffect(() => {
    if (authLoading || user) return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setBookmarkedIds(new Set(JSON.parse(stored)))
    }
    setIsLoaded(true)
  }, [authLoading, user])

  useEffect(() => {
    if (user || !isLoaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(bookmarkedIds)))
  }, [bookmarkedIds, isLoaded, user])

  // Logged in: the `bookmarks` table is the source of truth instead. On
  // first login, anything saved anonymously gets folded into the account
  // (upsert, then clear localStorage) so creating an account doesn't wipe
  // out what was already saved — skipped entirely if there's nothing local.
  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    const load = async () => {
      if (!migratedRef.current) {
        migratedRef.current = true
        const stored = localStorage.getItem(STORAGE_KEY)
        const localIds: string[] = stored ? JSON.parse(stored) : []
        if (localIds.length > 0) {
          await supabase
            .from("bookmarks")
            .upsert(
              localIds.map((article_id) => ({ user_id: user.id, article_id })),
              { onConflict: "user_id,article_id" }
            )
          localStorage.removeItem(STORAGE_KEY)
        }
      }

      const { data } = await supabase
        .from("bookmarks")
        .select("article_id")
        .eq("user_id", user.id)
      setBookmarkedIds(new Set((data ?? []).map((row) => row.article_id as string)))
      setIsLoaded(true)
    }

    load()
  }, [user])

  const toggleBookmark = (id: string) => {
    // Saving requires an account: prompt anonymous visitors to log in
    // instead of silently writing to localStorage, so a "save" always lands
    // somewhere the visitor can actually get back to. The prompt (rather
    // than an immediate redirect) gives them the option to back out instead
    // of being yanked off the page they were reading. `next` round-trips
    // through the magic-link flow (see /login, /auth/callback) so they land
    // back on this exact page, filters and all, once they're signed in.
    if (authLoading) return
    if (!user) {
      setLoginPromptNext(window.location.pathname + window.location.search)
      return
    }

    const wasBookmarked = bookmarkedIds.has(id)

    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (wasBookmarked) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

    // RLS on `bookmarks` requires user_id = auth.uid() on writes, so it has
    // to be set explicitly here rather than relying on a table default.
    const supabase = createClient()
    if (wasBookmarked) {
      supabase.from("bookmarks").delete().eq("user_id", user.id).eq("article_id", id).then()
    } else {
      supabase.from("bookmarks").insert({ user_id: user.id, article_id: id }).then()
    }
  }

  const isBookmarked = (id: string) => bookmarkedIds.has(id)

  return (
    <BookmarksContext.Provider value={{ bookmarkedIds, toggleBookmark, isBookmarked }}>
      {children}
      <LoginPromptModal next={loginPromptNext} onClose={() => setLoginPromptNext(null)} />
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
