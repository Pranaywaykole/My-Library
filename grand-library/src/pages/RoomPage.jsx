import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './RoomPage.css'

/*
  The room page embeds the interactive room directly
  inside React. The game loop logic from room.js is
  brought in here as a React component using useRef
  and useEffect to manage the animation loop.
*/

const CONFIG = {
  moveSpeed:  8,
  roomWidth:  900,
  roomHeight: 550,
  charWidth:  44,
  charHeight: 54,
  wallBuffer: 18,
}

const FURNITURE = [
  { x:20,  y:20,  w:100, h:60,  label:"Bookshelf" },
  { x:130, y:20,  w:100, h:60,  label:"Bookshelf" },
  { x:240, y:20,  w:100, h:60,  label:"Bookshelf" },
  { x:20,  y:200, w:60,  h:80,  label:"Bookshelf" },
  { x:350, y:20,  w:80,  h:60,  label:"Bookshelf" },
  { x:150, y:180, w:120, h:70,  label:"Reading Table" },
  { x:550, y:340, w:100, h:60,  label:"Reading Table" },
  { x:600, y:80,  w:80,  h:50,  label:"Coffee Table" },
  { x:100, y:360, w:140, h:55,  label:"Sofa" },
  { x:100, y:460, w:140, h:55,  label:"Sofa" },
  { x:470, y:20,  w:200, h:45,  label:"Coffee Bar" },
  { x:690, y:20,  w:40,  h:50,  label:"Coffee Machine" },
]

const ZONES = [
  { name:"Grand Hall",     x:14,  y:14,  w:430, h:260, color:"#c9a84c" },
  { name:"Coffee Shop",    x:460, y:14,  w:426, h:260, color:"#8b5a2b" },
  { name:"Reading Lounge", x:14,  y:290, w:430, h:246, color:"#2ecc71" },
  { name:"The Quiet Study",x:460, y:290, w:426, h:246, color:"#8e44ad" },
]

function RoomPage({ chosenCharacter }) {
  /* Refs hold mutable values that don't cause re-renders */
  const playerRef    = useRef(null)
  const zoneRef      = useRef(null)
  const minimapRef   = useRef(null)
  const logRef       = useRef(null)
  const promptRef    = useRef(null)
  const stateRef     = useRef({
    x: 400, y: 280,
    keys: {
      ArrowUp:false, ArrowDown:false,
      ArrowLeft:false, ArrowRight:false,
      w:false, a:false, s:false, d:false,
    },
    currentZone: "Grand Hall",
    running: true,
  })
  const rafRef = useRef(null)

  const charName  = chosenCharacter?.name  || "Guest"
  const charEmoji = chosenCharacter?.emoji || "📚"

  function isPositionSafe(nx, ny) {
    const { wallBuffer:wb, roomWidth:rw, roomHeight:rh,
            charWidth:cw, charHeight:ch } = CONFIG
    if (nx < wb || ny < wb) return false
    if (nx + cw > rw - wb)  return false
    if (ny + ch > rh - wb)  return false

    for (const f of FURNITURE) {
      const ox = nx < f.x+f.w+8 && nx+cw > f.x-8
      const oy = ny < f.y+f.h+8 && ny+ch > f.y-8
      if (ox && oy) return false
    }
    return true
  }

  function detectZone() {
    const s   = stateRef.current
    const cx  = s.x + CONFIG.charWidth  / 2
    const cy  = s.y + CONFIG.charHeight / 2
    for (const z of ZONES) {
      if (cx>z.x && cx<z.x+z.w && cy>z.y && cy<z.y+z.h) {
        if (z.name !== s.currentZone) {
          s.currentZone = z.name
          if (zoneRef.current) {
            zoneRef.current.textContent = z.name
            zoneRef.current.style.color = z.color
          }
          addLog(`Entered ${z.name}`)
        }
        return
      }
    }
  }

  function addLog(msg, highlight=false) {
    if (!logRef.current) return
    const p = document.createElement("p")
    p.className = `log-entry${highlight?" highlight":""}`
    p.textContent = msg
    logRef.current.prepend(p)
    const entries = logRef.current.querySelectorAll(".log-entry")
    if (entries.length > 8) entries[entries.length-1].remove()
  }

  function updateMinimap() {
    if (!minimapRef.current) return
    const s = stateRef.current
    const mx = (s.x / CONFIG.roomWidth)  * 90
    const my = (s.y / CONFIG.roomHeight) * 55
    minimapRef.current.style.left = `${mx}px`
    minimapRef.current.style.top  = `${my}px`
  }

  function gameLoop() {
    const s   = stateRef.current
    if (!s.running) return
    const sp  = CONFIG.moveSpeed
    let nx    = s.x
    let ny    = s.y

    if (s.keys.ArrowUp    || s.keys.w) ny -= sp
    if (s.keys.ArrowDown  || s.keys.s) ny += sp
    if (s.keys.ArrowLeft  || s.keys.a) nx -= sp
    if (s.keys.ArrowRight || s.keys.d) nx += sp

    const moved = nx !== s.x || ny !== s.y

    if (isPositionSafe(nx, s.y)) s.x = nx
    if (isPositionSafe(s.x, ny)) s.y = ny

    if (playerRef.current) {
      playerRef.current.style.left = `${s.x}px`
      playerRef.current.style.top  = `${s.y}px`
      playerRef.current.classList.toggle("walking", moved)
    }

    detectZone()
    updateMinimap()

    rafRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    const s = stateRef.current
    s.running = true

    function onKeyDown(e) {
      if (e.key in s.keys) {
        s.keys[e.key] = true
        e.preventDefault()
      }
    }
    function onKeyUp(e) {
      if (e.key in s.keys) s.keys[e.key] = false
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup",   onKeyUp)

    if (playerRef.current) {
      playerRef.current.style.left = `${s.x}px`
      playerRef.current.style.top  = `${s.y}px`
    }

    rafRef.current = requestAnimationFrame(gameLoop)
    addLog("Use Arrow Keys or WASD to move.")
    addLog(`${charName} has entered the library.`, true)

    /*
      Cleanup — stop the game loop and remove
      event listeners when navigating away.
    */
    return () => {
      s.running = false
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup",   onKeyUp)
    }
  }, [])

  return (
    <div className="room-page">

      {/* Top Bar */}
      <div className="room-topbar">
        <div className="room-topbar-left">
          <Link to="/" className="room-back-btn">← Back to Library</Link>
          <span className="zone-display" ref={zoneRef}>Grand Hall</span>
        </div>
        <div className="room-topbar-right">
          <span className="room-char-display">
            {charEmoji} {charName}
          </span>
          <span className="room-hint">Arrow Keys or WASD to move</span>
        </div>
      </div>

      {/* Room Wrapper */}
      <div className="room-wrapper">
        <div className="room-floor">

          {/* Walls */}
          <div className="wall wall-top" />
          <div className="wall wall-bottom" />
          <div className="wall wall-left" />
          <div className="wall wall-right" />

          {/* Zones */}
          <div className="zone zone-grand-hall" />
          <div className="zone zone-coffee-shop" />
          <div className="zone zone-reading-lounge" />
          <div className="zone zone-study" />

          {/* Zone Labels */}
          <div className="zone-label" style={{left:200,top:80}}>Grand Hall</div>
          <div className="zone-label" style={{left:680,top:80}}>Coffee Shop</div>
          <div className="zone-label" style={{left:120,top:380}}>Reading Lounge</div>
          <div className="zone-label" style={{left:700,top:380}}>The Quiet Study</div>

          {/* Furniture */}
          <div className="furniture bookshelf" style={{left:20,  top:20,  width:100, height:60}} />
          <div className="furniture bookshelf" style={{left:130, top:20,  width:100, height:60}} />
          <div className="furniture bookshelf" style={{left:240, top:20,  width:100, height:60}} />
          <div className="furniture bookshelf" style={{left:20,  top:200, width:60,  height:80}} />
          <div className="furniture bookshelf" style={{left:350, top:20,  width:80,  height:60}} />
          <div className="furniture table"     style={{left:150, top:180, width:120, height:70}} />
          <div className="furniture table"     style={{left:550, top:340, width:100, height:60}} />
          <div className="furniture table"     style={{left:600, top:80,  width:80,  height:50}} />
          <div className="furniture sofa"      style={{left:100, top:360, width:140, height:55}} />
          <div className="furniture sofa"      style={{left:100, top:460, width:140, height:55}} />
          <div className="furniture coffee-counter" style={{left:470, top:20, width:200, height:45}} />
          <div className="furniture coffee-machine" style={{left:690, top:20, width:40,  height:50}} />
          <div className="furniture plant"     style={{left:440, top:20,  width:28, height:28}} />
          <div className="furniture plant"     style={{left:440, top:270, width:24, height:24}} />
          <div className="furniture lamp"      style={{left:420, top:130, width:16, height:16}} />
          <div className="furniture lamp"      style={{left:420, top:400, width:16, height:16}} />

          {/* Player Character */}
          <div className="character-sprite" ref={playerRef}>
            <div className="character-bubble">{charEmoji}</div>
            <div className="character-name">{charName}</div>
            <div className="character-shadow" />
          </div>

          {/* Interaction Prompt */}
          <div className="interaction-prompt" ref={promptRef} />

        </div>
      </div>

      {/* Minimap */}
      <div className="minimap">
        <div className="minimap-title">Room Map</div>
        <div className="minimap-floor">
          <div className="minimap-player" ref={minimapRef} />
        </div>
      </div>

      {/* Message Log */}
      <div className="message-log">
        <div className="message-log-title">Room Events</div>
        <div className="message-log-body" ref={logRef} />
      </div>

    </div>
  )
}

export default RoomPage