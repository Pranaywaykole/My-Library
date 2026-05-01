function BookCard({ book, onReadNow }) {
  /*
    Format author name from "Austen, Jane" to "Jane Austen"
  */
  function formatAuthor(raw) {
    if (!raw) return "Unknown Author";
    const parts = raw.split(",");
    if (parts.length === 2) return `${parts[1].trim()} ${parts[0].trim()}`;
     console.log(book)
    return raw;
   }

  const author     = formatAuthor(book.authors[0]?.name);
  const coverUrl   = book.formats["image/jpeg"]
    || `https://via.placeholder.com/100x150/1a1a2e/c9a84c?text=${book.title.charAt(0)}`;
  const subject    = book.subjects[0]
    ? book.subjects[0].replace(/\s*--\s*Fiction/gi, "").trim()
    : "Classic";
  const genre      = subject.length > 20 ? subject.slice(0, 18) + "..." : subject;
  const isPopular  = book.download_count > 10000;

  return (
    <div className="book-card">

      {isPopular && <span className="card-badge">Popular</span>}

      <img
        src={coverUrl}
        alt={`Cover of ${book.title}`}
        onError={(e) => {
          e.target.src = `https://via.placeholder.com/100x150/1a1a2e/c9a84c?text=Book`;
        }}
      />

      <h3>{book.title.length > 40
        ? book.title.slice(0, 38) + "..."
        : book.title}
      </h3>

      <p className="author">By {author}</p>

      <span className="genre-tag">{genre}</span>

      <button onClick={() => onReadNow(book.id)}>
        Read Now
      </button>

    </div>
  );
}

export default BookCard