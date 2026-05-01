const characters = [
  {
    id: 1,
    name:  "The Scholar",
    emoji: "🧙",
    desc:  "Loves classics and philosophy. Always found in the Grand Hall.",
    count: 245,
    status: "online",
    cardClass: "scholar-card",
  },
  {
    id: 2,
    name:  "The Detective",
    emoji: "🕵️",
    desc:  "Mystery lover. Usually spotted in the coffee shop with a notebook.",
    count: 189,
    status: "online",
    cardClass: "detective-card",
  },
  {
    id: 3,
    name:  "The Wanderer",
    emoji: "🧝",
    desc:  "Reads everything. No fixed spot — roams all rooms freely.",
    count: 312,
    status: "offline",
    cardClass: "wanderer-card",
  },
];

function CharacterSection({ chosenCharacter, onCharacterSelect }) {
  return (
    <section className="character-section" id="characters">
      <h2>Create Your Character</h2>
      <p className="section-subtitle">
        Choose who you are before you enter the library
      </p>

      <div className="character-preview-container">
        {characters.map(char => (
          <div
            key={char.id}
            className={`character-card ${char.cardClass} ${
              chosenCharacter.name === char.name ? "selected-character" : ""
            }`}
            onClick={() => onCharacterSelect({
              name:  char.name,
              emoji: char.emoji,
            })}
          >
            <div className={`character-status ${char.status}`} />
            <div className="character-avatar">{char.emoji}</div>
            <h3>{char.name}</h3>
            <p>{char.desc}</p>
            <span className="character-tag">
              {char.count} readers chose this
            </span>
          </div>
        ))}
      </div>

    </section>
  );
}

export default CharacterSection