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
        "btn-oval inline-flex items-center justify-center gap-2 px-12 py-5 text-sm font-medium",
        bookmarked && "is-active"
      )}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      {bookmarked ? "Saved" : "Bookmark"}
    </button>
  );
}
