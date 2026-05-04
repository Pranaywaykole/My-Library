import { Link, useLocation } from 'react-router-dom'

function NavBar({ chosenCharacter }) {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="nav-logo">📚 The Grand Library</div>
      <div className="nav-links">
        <Link
          to="/"
          className={location.pathname === "/" ? "active-link" : ""}
        >
          Home
        </Link>
        <a href="#books">Library</a>
        <a href="#characters">My Character</a>
        <Link to="/room">Enter Room</Link>
      </div>
    </nav>
  )
}

export default NavBar