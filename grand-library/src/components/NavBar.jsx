function NavBar({ chosenCharacter }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">📚 The Grand Library</div>
      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#books">Library</a>
        <a href="#characters">My Character</a>
        <a href="/room.html">Enter Room</a>
      </div>
    </nav>
  );
}

export default NavBar