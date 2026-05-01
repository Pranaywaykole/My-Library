function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">
          <span>📚 The Grand Library</span>
          <p>A free, open library for every reader in the world.</p>
        </div>
        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#books">Books</a>
          <a href="#characters">Characters</a>
        </div>
      </div>
      <p className="footer-bottom">
        The Grand Library © 2026. All books are free to read.
      </p>
    </footer>
  );
}

export default Footer