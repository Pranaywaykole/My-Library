import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import HomePage    from './pages/HomePage'
import RoomPage    from './pages/RoomPage'
import ReaderPage  from './pages/ReaderPage'
import Notification from './components/Notification'
import './App.css'

function App() {
  const [chosenCharacter, setChosenCharacter] = useState(() => ({
    name:  localStorage.getItem("chosenCharacter") || "",
    emoji: localStorage.getItem("chosenEmoji")     || "",
  }))

  const [notification, setNotification] = useState("")

  function showNotification(message) {
    setNotification(message)
    setTimeout(() => setNotification(""), 3000)
  }

  function handleCharacterSelect(character) {
    setChosenCharacter(character)
    localStorage.setItem("chosenCharacter", character.name)
    localStorage.setItem("chosenEmoji",     character.emoji)
    showNotification(`You are now playing as ${character.name}!`)
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              chosenCharacter={chosenCharacter}
              onCharacterSelect={handleCharacterSelect}
              showNotification={showNotification}
            />
          }
        />
        <Route
          path="/room"
          element={
            <RoomPage chosenCharacter={chosenCharacter} />
          }
        />
        <Route
          path="/reader/:bookId"
          element={<ReaderPage />}
        />
        <Route
          path="*"
          element={
            <div style={{
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              minHeight:"100vh", gap:"20px"
            }}>
              <h1 style={{color:"#1a1a2e", fontSize:"48px"}}>404</h1>
              <p style={{color:"#888"}}>Page not found</p>
              <a href="/" style={{color:"#c9a84c"}}>Back to Library</a>
            </div>
          }
        />
      </Routes>

      {notification && <Notification message={notification} />}
    </>
  )
}

export default App