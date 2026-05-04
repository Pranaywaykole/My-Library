import { useState, useEffect } from 'react'
import { useParams, Link }     from 'react-router-dom'
import { useReader }           from '../hooks/useReader'
import './ReaderPage.css'

function ReaderPage() {
  const { bookId }  = useParams()
  const [fontSize,  setFontSize]  = useState(() =>
    parseInt(localStorage.getItem("reader_font_size") || "17")
  )
  const [theme, setTheme] = useState(
    () => localStorage.getItem("reader_theme") || "sepia"
  )

  const {
    book, pages, currentPage,
    loading, error, loadingText,
    goToNext, goToPrev,
  } = useReader(bookId)

  /* Keyboard navigation */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        goToNext()
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        goToPrev()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [goToNext, goToPrev])

  function changeFontSize(delta) {
    const next = Math.min(24, Math.max(13, fontSize + delta))
    setFontSize(next)
    localStorage.setItem("reader_font_size", next)
  }

  function changeTheme(t) {
    setTheme(t)
    localStorage.setItem("reader_theme", t)
  }

  function formatAuthor(raw) {
    if (!raw) return "Unknown Author"
    const parts = raw.split(",")
    if (parts.length === 2) return `${parts[1].trim()} ${parts[0].trim()}`
    return raw
  }

  function formatPageAsHtml(text) {
    return text
      .split(/\n\n+/)
      .filter(p => p.trim().length > 0)
      .map(p => `<p>${p.replace(/\n/g, " ").trim()}</p>`)
      .join("")
  }

  const totalPages = pages.length
  const progress   = totalPages > 0
    ? Math.round(((currentPage + 1) / totalPages) * 100)
    : 0

  const author = book?.authors[0]
    ? formatAuthor(book.authors[0].name)
    : "Unknown Author"

  const coverUrl = book?.formats["image/jpeg"] || ""

  const genre = book?.subjects[0]
    ? book.subjects[0].replace(/\s*--\s*Fiction/gi, "").trim()
    : "Classic"

  return (
    <div className={`reader-page-wrapper theme-${theme}`}>

      {/* ── TOP BAR ── */}
      <div className="reader-topbar">
        <div className="reader-topbar-left">
          <Link to="/" className="reader-back-btn">← Back to Library</Link>
          <div className="reader-book-meta">
            <div className="reader-book-title">
              {book ? book.title : "Loading..."}
            </div>
            <div className="reader-book-author">{author}</div>
          </div>
        </div>

        <div className="reader-controls">
          <button className="ctrl-btn" onClick={() => changeFontSize(-1)}>A−</button>
          <span className="font-display">{fontSize}</span>
          <button className="ctrl-btn" onClick={() => changeFontSize(1)}>A+</button>

          <div className="theme-switcher">
            {["sepia", "dark", "light"].map(t => (
              <button
                key={t}
                className={`theme-btn ${theme === t ? "active" : ""}`}
                onClick={() => changeTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="reader-body">

        {/* ── SIDEBAR ── */}
        <div className="reader-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Book Cover</div>
            <div className="cover-container">
              {coverUrl
                ? <img src={coverUrl} alt={book?.title} className="cover-img" />
                : <div className="cover-placeholder">📚</div>
              }
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Details</div>
            <div className="meta-item">
              <div className="meta-key">Author</div>
              <div className="meta-val">{author}</div>
            </div>
            <div className="meta-item">
              <div className="meta-key">Genre</div>
              <div className="meta-val">{genre}</div>
            </div>
            <div className="meta-item">
              <div className="meta-key">Downloads</div>
              <div className="meta-val">
                {book ? book.download_count.toLocaleString() : "—"}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Reading Progress</div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">
              {totalPages > 0
                ? `Page ${currentPage + 1} of ${totalPages} · ${progress}%`
                : "Loading..."}
            </div>
          </div>
        </div>

        {/* ── READING AREA ── */}
        <div className="reader-content">

          {loading && (
            <div className="reader-loading">
              <div className="loading-spinner" />
              <p>{loadingText}</p>
              <p className="loading-sub">
                This may take a moment for larger books
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="reader-error">
              <p className="error-icon">📚</p>
              <p className="error-title">Could not load book</p>
              <p className="error-msg">{error}</p>
              <Link to="/" className="retry-btn">Back to Library</Link>
            </div>
          )}

          {!loading && !error && pages.length > 0 && (
            <div className="book-content">
              <div
                className="book-text"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{
                  __html: formatPageAsHtml(pages[currentPage])
                }}
              />
            </div>
          )}

        </div>
      </div>

      {/* ── BOTTOM NAVIGATION ── */}
      {!loading && !error && pages.length > 0 && (
        <div className="reader-bottombar">
          <button
            className="nav-btn"
            disabled={currentPage === 0}
            onClick={goToPrev}
          >
            ← Previous
          </button>

          <span className="page-indicator">
            Page {currentPage + 1} of {totalPages.toLocaleString()}
          </span>

          <button
            className="nav-btn"
            disabled={currentPage === totalPages - 1}
            onClick={goToNext}
          >
            Next →
          </button>
        </div>
      )}

    </div>
  )
}

export default ReaderPage