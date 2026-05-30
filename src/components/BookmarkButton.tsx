"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

const BOOKMARK_KEY = "dp_bookmarks";

function getIds(): string[] {
  try {
    const v = localStorage.getItem(BOOKMARK_KEY);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}

function saveIds(ids: string[]) {
  try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids)); } catch {}
}

export default function BookmarkButton({ articleId }: { articleId: string }) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(getIds().includes(articleId));
  }, [articleId]);

  const toggle = () => {
    const ids = getIds();
    const next = bookmarked ? ids.filter((id) => id !== articleId) : [...ids, articleId];
    saveIds(next);
    setBookmarked(!bookmarked);
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-4 py-2 border text-[13px] font-medium rounded-lg transition-colors ${
        bookmarked
          ? "text-blue-600 border-blue-200 bg-blue-50"
          : "text-gray-500 hover:bg-gray-50 hover:border-gray-200"
      }`}
      style={bookmarked ? {} : { borderColor: "#e8e8e8" }}
    >
      <Bookmark size={13} fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "Saved" : "Bookmark"}
    </button>
  );
}
