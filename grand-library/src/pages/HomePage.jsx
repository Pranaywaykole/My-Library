import NavBar           from '../components/NavBar'
import Hero             from '../components/Hero'
import BookList         from '../components/BookList'
import RoomSection      from '../components/RoomSection'
import CharacterSection from '../components/CharacteSection'
import Footer           from '../components/Footer'

function HomePage({ chosenCharacter, onCharacterSelect, showNotification }) {
  return (
    <div className="app">

      <NavBar chosenCharacter={chosenCharacter} />

      <Hero />

      <BookList showNotification={showNotification} />

      <RoomSection />

      <CharacterSection
        chosenCharacter={chosenCharacter}
        onCharacterSelect={onCharacterSelect}
      />

      <Footer />

      {chosenCharacter.name && (
        <div className="floating-character">
          {chosenCharacter.emoji} {chosenCharacter.name}
        </div>
      )}

    </div>
  )
}

export default HomePage