// Hand-drawn oval outline — same shape as the Sources page's "close
// folder" button (SourcesFolderCover.tsx), reused here for the article
// page's action buttons. preserveAspectRatio="none" so it stretches to
// exactly fill whatever box it's dropped into, however wide the button's
// padding/content makes that box.
export function OvalOutline() {
  return (
    <svg
      viewBox="0 0 200 90"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <path
        d="M22,48 C20,24 58,7 101,6 C148,5 182,16 183,39 C184,58 151,78 100,81 C56,83 20,70 21,49"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M17,52 C16,27 54,10 97,9 C142,8 178,19 181,41 C183,60 149,79 96,81"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
