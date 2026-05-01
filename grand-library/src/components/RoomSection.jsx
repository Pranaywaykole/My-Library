const rooms = [
  { icon: "☕", name: "Coffee Shop",    desc: "Cozy corner with soft chatter. Chat with fellow readers." },
  { icon: "🛋️", name: "Reading Lounge", desc: "Big sofas and silence. Perfect for deep reading." },
  { icon: "🏛️", name: "Grand Hall",     desc: "The main library floor. Explore shelves and discover books." },
  { icon: "🌿", name: "Garden Terrace", desc: "Read outdoors under open sky with nature sounds." },
  { icon: "📖", name: "The Quiet Study", desc: "Absolute silence. Only the most focused readers come here." },
];

function RoomSection() {
  return (
    <section className="rooms-section">
      <h2>Choose Your Reading Spot</h2>
      <p className="section-subtitle">Every room has its own atmosphere</p>

      <div className="rooms-container">
        {rooms.map(room => (
          <div key={room.name} className="room-card">
            <div className="room-icon">{room.icon}</div>
            <h3>{room.name}</h3>
            <p>{room.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RoomSection