import { useState, useEffect } from 'react'
import BookCard from './BookCard'

const API_BASE = "https://gutendex.com/books";

function BookList({ showNotification }) {
  const [books,       setBooks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [totalCount,  setTotalCount]  = useState(0);
  const [nextUrl,     setNextUrl]     = useState(null);
  const [prevUrl,     setPrevUrl]     = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const topics = [
    { label: "All",        value: "" },
    { label: "Mystery",    value: "mystery" },
    { label: "Romance",    value: "romance" },
    { label: "Adventure",  value: "adventure" },
    { label: "Horror",     value: "horror" },
    { label: "Sci-Fi",     value: "science fiction" },
    { label: "Philosophy", value: "philosophy" },
  ];

  /*
    Build the API URL from current state.
    Runs whenever searchTerm, activeTopic, or currentPage changes.
  */
  function buildUrl() {
    const params = new URLSearchParams();
    if (searchTerm)  params.set("search", searchTerm);
    if (activeTopic) params.set("topic",  activeTopic);
    if (currentPage > 1) params.set("page", currentPage);
    const qs = params.toString();
    return qs ? `${API_BASE}?${qs}` : API_BASE;
  }

  /*
    Fetch books whenever search, topic, or page changes.
    The dependency array [searchTerm, activeTopic, currentPage]
    means this effect re-runs whenever any of those change.
  */
  useEffect(() => {
    let cancelled = false; /* prevent stale state updates */

    async function loadBooks() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(buildUrl());
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();

        if (!cancelled) {
          setBooks(data.results);
          setTotalCount(data.count);
          setNextUrl(data.next);
          setPrevUrl(data.previous);
        }

      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    /*
      Debounce search — wait 500ms after searchTerm changes
      before actually fetching. This prevents a fetch on
      every single keystroke.
    */
    const timer = setTimeout(loadBooks, searchTerm ? 500 : 0);

    /*
      Cleanup function — cancels the timer if the effect
      runs again before the timer fires. This prevents
      race conditions when the user types fast.
    */
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };

  }, [searchTerm, activeTopic, currentPage]);

  function handleTopicChange(topic) {
    setActiveTopic(topic);
    setCurrentPage(1);
    setSearchTerm(""); /* clear search when genre filter clicked */
  }

  function handleSearch(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    setActiveTopic(""); /* clear topic when searching */
  }

  function handleReadNow(bookId) {
    window.location.href = `/reader.html?id=${bookId}`;
  }

  /* ── Skeleton loader while fetching ── */
  if (loading) {
    return (
      <section className="books-section" id="books">
        <h2>Featured Books</h2>
        <p className="section-subtitle">Loading from Project Gutenberg...</p>
        <div className="books-container">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="book-card skeleton">
              <div className="skeleton-img" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
              <div className="skeleton-badge" />
              <div className="skeleton-btn" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <section className="books-section" id="books">
        <div className="error-state">
          <p className="error-icon">📚</p>
          <p className="error-title">Could not load books</p>
          <p className="error-message">{error}</p>
          <button
            className="retry-btn"
            onClick={() => setCurrentPage(p => p)}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(totalCount / 32);

  return (
    <section className="books-section" id="books">
      <h2>Featured Books</h2>
      <p className="section-subtitle">
        70,000+ free classics from Project Gutenberg
      </p>

      {/* Results count */}
      <p className="results-count">
        {totalCount.toLocaleString()} books found
      </p>

      {/* Search bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Genre filter buttons */}
      <div className="genre-filters">
        {topics.map(topic => (
          <button
            key={topic.value}
            className={`genre-filter ${activeTopic === topic.value ? "active" : ""}`}
            onClick={() => handleTopicChange(topic.value)}
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* No results state */}
      {books.length === 0 ? (
        <div className="no-results">
          <p>No books found for your search.</p>
          <p>Try a different term or genre.</p>
        </div>
      ) : (
        /* Books grid */
        <div className="books-container">
          {books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onReadNow={handleReadNow}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-inner">
            <button
              className="page-btn"
              disabled={!prevUrl}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages.toLocaleString()}
            </span>
            <button
              className="page-btn"
              disabled={!nextUrl}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

    </section>
  );
}

export default BookList