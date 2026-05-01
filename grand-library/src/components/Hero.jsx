function Hero() {
  function handleEnter() {
    window.location.href = "/room.html";
  }

  return (
    <header className="hero" id="home">
      <div className="hero-content">
        <h1>Welcome to The Grand Library</h1>
        <p>Step inside. Choose your character. Find your story.</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={handleEnter}>
            Enter Library
          </button>
          <button className="btn-secondary">
            Create Character
          </button>
        </div>
      </div>
    </header>
  );
}

export default Hero