"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/lib/bookmarks-context";

export function ArticleBookmarkButton({ articleId }: { articleId: string }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(articleId);

  return (
    <button
      onClick={() => toggleBookmark(articleId)}
      className={cn(
        "inline-flex items-center gap-2 px-6 py-2.5 border text-sm font-medium transition-colors",
        bookmarked
          ? "border-foreground bg-foreground text-background"
          : "border-border text-foreground hover:bg-secondary"
      )}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      {bookmarked ? "Saved" : "Bookmark"}
    </button>
  );
}
