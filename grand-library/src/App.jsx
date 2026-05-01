import { useState } from 'react'
import NavBar from './components/NavBar.jsx'
import Hero from './components/Hero'
import BookList from './components/BookList'
import RoomSection from './components/RoomSection'
import CharacterSection from './components/CharacteSection.jsx'
import Footer from './components/Footer'
import Notification from './components/Notification'
import './App.css'                               /* Add this line at the top of App.jsx */

function App() {
  /*
    State that is shared between multiple components
    lives in the nearest common ancestor — App.
    This is called "lifting state up."
  */
  const [chosenCharacter, setChosenCharacter] = useState(
    /*
      Initialize from localStorage so the character
      persists between page refreshes.
      The function form of useState only runs once.
    */
    () => ({
      name:  localStorage.getItem("chosenCharacter") || "",
      emoji: localStorage.getItem("chosenEmoji")     || "",
    })
  );

  const [notification, setNotification] = useState("");

  function showNotification(message) {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  }

  function handleCharacterSelect(character) {
    setChosenCharacter(character);
    localStorage.setItem("chosenCharacter", character.name);
    localStorage.setItem("chosenEmoji",     character.emoji);
    showNotification(`You are now playing as ${character.name}!`);
  }

  return (
    <div className="app">

      <NavBar chosenCharacter={chosenCharacter} />

      <Hero />

      <BookList showNotification={showNotification} />

      <RoomSection />

      <CharacterSection
        chosenCharacter={chosenCharacter}
        onCharacterSelect={handleCharacterSelect}
      />

      <Footer />

      {/* Only render notification when there is a message */}
      {notification && <Notification message={notification} />}

      {/* Floating character indicator */}
      {chosenCharacter.name && (
        <div className="floating-character">
          {chosenCharacter.emoji} {chosenCharacter.name}
        </div>
      )}

    </div>
  );
}

export default App