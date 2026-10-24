// Genre choices fit naturally; only the full sidebar scrolls if needed.
export default function GenreOptions({ children }) {
  return <div className="events-genres">
    <div className="events-filters__genres" role="group" aria-label="Genre options">
      {children}
    </div>
  </div>
}
