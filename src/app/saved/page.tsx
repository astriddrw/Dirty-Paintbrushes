import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SavedContent } from "@/components/saved-content"
import { BookmarksProvider } from "@/lib/bookmarks-context"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Saved Articles | Dirty Paintbrushes",
  description: "Your bookmarked articles for easy reference.",
}

export default function SavedPage() {
  return (
    <BookmarksProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <SavedContent />
        <Footer />
      </div>
    </BookmarksProvider>
  )
}
