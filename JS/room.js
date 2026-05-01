/* ================================
   room.js — The Library Room Engine
   ================================ */


/* ─────────────────────────────────
   SECTION 1 — CONFIGURATION
   All the numbers that control how
   the room behaves live here.
   Change these to tune the feel.
   ───────────────────────────────── */

const CONFIG = {
  /* How many pixels the character moves per key press */
  moveSpeed: 6,

  /* The room's actual pixel dimensions — must match room.css */
  roomWidth:  900,
  roomHeight: 550,

  /* The character sprite's size in pixels */
  charWidth:  44,
  charHeight: 54,

  /* Wall thickness — character cannot go closer than this to edges */
  wallBuffer: 18,

  /* How close the character must be to furniture to interact */
  interactDistance: 60,
};


/* ─────────────────────────────────
   SECTION 2 — GAME STATE
   This object holds the current
   state of everything in the room.
   ───────────────────────────────── */

const state = {
  /* Character's current position */
  x: 400,
  y: 280,

  /* Which direction keys are currently held down */
  keys: {
    ArrowUp:    false,
    ArrowDown:  false,
    ArrowLeft:  false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
  },

  /* Is the character currently moving? */
  isMoving: false,

  /* Which room zone is the character in? */
  currentZone: "Grand Hall",

  /* The character's chosen name and emoji */
  characterName:  "Scholar",
  characterEmoji: "🧙",

  /* Is the game loop running? */
  running: true,
};


/* ─────────────────────────────────
   SECTION 3 — FURNITURE COLLISION DATA
   Each piece of furniture is defined
   as a rectangle with x, y, width, height.
   The character cannot walk into these.
   These must match the CSS positions.
   ───────────────────────────────── */

const furniture = [
  /* Bookshelves */
  { x: 20,  y: 20,  w: 100, h: 60,  label: "Bookshelf" },
  { x: 130, y: 20,  w: 100, h: 60,  label: "Bookshelf" },
  { x: 240, y: 20,  w: 100, h: 60,  label: "Bookshelf" },
  { x: 20,  y: 200, w: 60,  h: 80,  label: "Bookshelf" },
  { x: 350, y: 20,  w: 80,  h: 60,  label: "Bookshelf" },

  /* Tables */
  { x: 150, y: 180, w: 120, h: 70,  label: "Reading Table — Press E to read" },
  { x: 550, y: 340, w: 100, h: 60,  label: "Reading Table — Press E to read" },
  { x: 600, y: 80,  w: 80,  h: 50,  label: "Coffee Table" },
  { x: 660, y: 160, w: 100, h: 45, label: "Coffee Room Table — Press E to sit" },
  

  /* Sofas */
  { x: 100, y: 360, w: 140, h: 55,  label: "Sofa — Press E to sit" },
  { x: 100, y: 460, w: 140, h: 55,  label: "Sofa — Press E to sit" },

  /* Chairs */
  { x: 140, y: 155, w: 35,  h: 35,  label: "Chair" },
  { x: 230, y: 155, w: 35,  h: 35,  label: "Chair" },
  { x: 140, y: 255, w: 35,  h: 35,  label: "Chair" },
  { x: 230, y: 255, w: 35,  h: 35,  label: "Chair" },
  { x: 740, y: 220, w: 30, h: 30,   label: "Chair" },

  /* Coffee counter */
  { x: 470, y: 20,  w: 200, h: 45,  label: "Coffee Bar — Press E for a cup" },
  { x: 690, y: 20,  w: 40,  h: 50,  label: "Coffee Machine" },
  
];


/* ─────────────────────────────────
   SECTION 4 — ROOM ZONES
   Each zone is a named area of the room.
   When the character enters a zone,
   the top bar updates to show the zone name.
   ───────────────────────────────── */

const zones = [
  {
    name: "Grand Hall",
    x: 14, y: 14,
    w: 430, h: 260,
    color: "#c9a84c"
  },
  {
    name: "Coffee Shop",
    x: 460, y: 14,
    w: 426, h: 260,
    color: "#8b5a2b"
  },
  {
    name: "Reading Lounge",
    x: 14, y: 290,
    w: 430, h: 246,
    color: "#2ecc71"
  },
  {
    name: "The Quiet Study",
    x: 460, y: 290,
    w: 426, h: 246,
    color: "#8e44ad"
  },
];


/* ─────────────────────────────────
   SECTION 5 — DOM REFERENCES
   Grab all the elements we need
   to update during the game loop.
   ───────────────────────────────── */

const player          = document.getElementById("player");
const characterBubble = document.getElementById("character-bubble");
const characterName   = document.getElementById("character-name");
const currentZoneEl   = document.getElementById("current-zone");
const interactPrompt  = document.getElementById("interaction-prompt");
const minimapPlayer   = document.getElementById("minimap-player");
const logBody         = document.getElementById("message-log-body");
const roomCharDisplay = document.getElementById("room-character-display");


/* ─────────────────────────────────
   SECTION 6 — INITIALISE CHARACTER
   Load the character the user chose
   on the homepage from localStorage.
   ───────────────────────────────── */

function initCharacter() {
  const savedName  = localStorage.getItem("chosenCharacter");
  const savedEmoji = localStorage.getItem("chosenEmoji");

  if (savedName && savedEmoji) {
    state.characterName  = savedName;
    state.characterEmoji = savedEmoji;
  }

  /*
    Update the DOM to show the character.
    textContent safely sets text without
    interpreting it as HTML.
  */
  characterBubble.textContent = state.characterEmoji;
  characterName.textContent   = state.characterName;
  roomCharDisplay.textContent = `${state.characterEmoji} ${state.characterName}`;

  addLogEntry(`${state.characterName} has entered the library.`, true);
}


/* ─────────────────────────────────
   SECTION 7 — KEYBOARD INPUT
   We track which keys are held down
   using keydown and keyup events.
   This allows smooth continuous
   movement while a key is held.
   ───────────────────────────────── */

document.addEventListener("keydown", (event) => {
  /*
    If the pressed key is one we care about,
    mark it as held down in state.keys.
    We also prevent the default browser behaviour
    for arrow keys (which would scroll the page).
  */
  if (event.key in state.keys) {
    state.keys[event.key] = true;
    event.preventDefault();
  }

  /* E key — interact with nearby furniture */
  if (event.key === "e" || event.key === "E") {
    interact();
  }
});

document.addEventListener("keyup", (event) => {
  /* When key is released, mark it as not held */
  if (event.key in state.keys) {
    state.keys[event.key] = false;
  }
});


/* ─────────────────────────────────
   SECTION 8 — COLLISION DETECTION
   Check if moving to a new position
   would cause the character to overlap
   with a wall or piece of furniture.
   Returns true if the position is safe.
   ───────────────────────────────── */

function isPositionSafe(newX, newY) {
  const { wallBuffer, roomWidth, roomHeight, charWidth, charHeight } = CONFIG;

  /* Check room boundaries — character must stay inside walls */
  if (newX < wallBuffer) return false;
  if (newY < wallBuffer) return false;
  if (newX + charWidth  > roomWidth  - wallBuffer) return false;
  if (newY + charHeight > roomHeight - wallBuffer) return false;

  /*
    Check each piece of furniture.
    We use AABB collision detection —
    Axis-Aligned Bounding Box.
    Two rectangles overlap if they
    overlap on BOTH the X and Y axes.
  */
  for (const item of furniture) {
    /*
      Add a small padding (8px) around furniture
      so the character feels like they bump
      into it slightly before stopping.
    */
    const padding = 8;

    const charLeft   = newX;
    const charRight  = newX + charWidth;
    const charTop    = newY;
    const charBottom = newY + charHeight;

    const itemLeft   = item.x - padding;
    const itemRight  = item.x + item.w + padding;
    const itemTop    = item.y - padding;
    const itemBottom = item.y + item.h + padding;

    /*
      If the character rectangle overlaps
      the furniture rectangle on both axes,
      there is a collision — position is not safe.
    */
    const overlapX = charLeft < itemRight  && charRight  > itemLeft;
    const overlapY = charTop  < itemBottom && charBottom > itemTop;

    if (overlapX && overlapY) return false;
  }

  return true;
}


/* ─────────────────────────────────
   SECTION 9 — ZONE DETECTION
   Check which zone the character
   is currently standing in and
   update the top bar if it changed.
   ───────────────────────────────── */

function detectZone() {
  const centerX = state.x + CONFIG.charWidth  / 2;
  const centerY = state.y + CONFIG.charHeight / 2;

  for (const zone of zones) {
    const insideX = centerX > zone.x && centerX < zone.x + zone.w;
    const insideY = centerY > zone.y && centerY < zone.y + zone.h;

    if (insideX && insideY) {
      /* Only update if the zone actually changed */
      if (zone.name !== state.currentZone) {
        state.currentZone = zone.name;
        currentZoneEl.textContent = zone.name;
        currentZoneEl.style.color = zone.color;
        addLogEntry(`Entered ${zone.name}`);
      }
      return;
    }
  }
}


/* ─────────────────────────────────
   SECTION 10 — INTERACTION SYSTEM
   When the character is near furniture
   show a prompt. When E is pressed,
   trigger the interaction.
   ───────────────────────────────── */

function checkNearbyFurniture() {
  const charCenterX = state.x + CONFIG.charWidth  / 2;
  const charCenterY = state.y + CONFIG.charHeight / 2;

  let closestItem     = null;
  let closestDistance = Infinity;

  for (const item of furniture) {
    const itemCenterX = item.x + item.w / 2;
    const itemCenterY = item.y + item.h / 2;

    /*
      Calculate the straight-line distance between
      the character's center and the furniture's center
      using the Pythagorean theorem: d = √(dx² + dy²)
    */
    const dx = charCenterX - itemCenterX;
    const dy = charCenterY - itemCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem     = item;
    }
  }

  /*
    If the closest item is within interaction range,
    show the prompt floating above the character.
  */
  if (closestDistance < CONFIG.interactDistance && closestItem) {
    interactPrompt.style.display = "block";
    interactPrompt.style.left    = `${state.x - 20}px`;
    interactPrompt.style.top     = `${state.y - 30}px`;
    interactPrompt.dataset.item  = closestItem.label;
  } else {
    interactPrompt.style.display = "none";
    interactPrompt.dataset.item  = "";
  }
}

function interact() {
  const itemLabel = interactPrompt.dataset.item;
  if (!itemLabel) return;

  /* Different responses for different furniture */
  if (itemLabel.includes("Sofa")) {
    addLogEntry(`${state.characterName} sits on the sofa and opens a book.`, true);
  } else if (itemLabel.includes("Coffee Bar")) {
    addLogEntry(`${state.characterName} orders a coffee. ☕`, true);
  } else if (itemLabel.includes("Reading Table")) {
    addLogEntry(`${state.characterName} sits down to read.`, true);
  } else if (itemLabel.includes("Bookshelf")) {
    addLogEntry(`${state.characterName} browses the bookshelf.`, true);
  } else {
    addLogEntry(`${state.characterName} interacts with ${itemLabel}.`, true);
  }
}


/* ─────────────────────────────────
   SECTION 11 — MINIMAP UPDATE
   Scale the character's room position
   down to the minimap size and move
   the minimap dot accordingly.
   ───────────────────────────────── */

function updateMinimap() {
  const minimapW = 90;
  const minimapH = 55;

  /*
    We scale the character's position proportionally.
    If character is at x=450 in a 900px room,
    on the minimap that becomes 45px in a 90px minimap.
    Simple ratio: minimap_pos = (char_pos / room_size) * minimap_size
  */
  const minimapX = (state.x / CONFIG.roomWidth)  * minimapW;
  const minimapY = (state.y / CONFIG.roomHeight) * minimapH;

  minimapPlayer.style.left = `${minimapX}px`;
  minimapPlayer.style.top  = `${minimapY}px`;
}


/* ─────────────────────────────────
   SECTION 12 — MESSAGE LOG
   Add entries to the room event log
   at the bottom left of the screen.
   ───────────────────────────────── */

function addLogEntry(message, highlight = false) {
  const entry = document.createElement("p");
  entry.classList.add("log-entry");
  if (highlight) entry.classList.add("highlight");
  entry.textContent = message;

  /*
    prepend adds to the TOP of the log
    so newest messages appear first.
  */
  logBody.prepend(entry);

  /*
    Keep only the last 8 messages.
    Remove oldest entries when list gets too long.
  */
  const entries = logBody.querySelectorAll(".log-entry");
  if (entries.length > 8) {
    entries[entries.length - 1].remove();
  }
}


/* ─────────────────────────────────
   SECTION 13 — THE GAME LOOP
   This is the heart of the room engine.
   requestAnimationFrame runs this function
   ~60 times per second, creating smooth
   continuous movement.
   ───────────────────────────────── */

function gameLoop() {
  if (!state.running) return;

  const speed = CONFIG.moveSpeed;
  let moved = false;
  let newX  = state.x;
  let newY  = state.y;

  /*
    Check which direction keys are held.
    Both arrow keys AND WASD work — they
    set the same state.keys flags.
  */
  if (state.keys.ArrowUp    || state.keys.w) { newY -= speed; }
  if (state.keys.ArrowDown  || state.keys.s) { newY += speed; }
  if (state.keys.ArrowLeft  || state.keys.a) { newX -= speed; }
  if (state.keys.ArrowRight || state.keys.d) { newX += speed; }

  moved = newX !== state.x || newY !== state.y;

  /*
    We try horizontal and vertical movement separately.
    This allows sliding along walls —
    if you walk into a wall at a diagonal,
    the character slides along it instead of stopping dead.
  */
  if (moved) {
    /* Try moving horizontally */
    if (isPositionSafe(newX, state.y)) {
      state.x = newX;
    }

    /* Try moving vertically */
    if (isPositionSafe(state.x, newY)) {
      state.y = newY;
    }
  }

  /*
    Update the character's visual position on screen.
    We update the CSS left and top properties
    to match the state position.
  */
  player.style.left = `${state.x}px`;
  player.style.top  = `${state.y}px`;

  /*
    Add or remove the walking class.
    The CSS uses this to trigger the
    bobbing animation while moving.
  */
  if (moved) {
    player.classList.add("walking");
  } else {
    player.classList.remove("walking");
  }

  /*
    Run all the systems that check
    the character's current position.
  */
  detectZone();
  checkNearbyFurniture();
  updateMinimap();

  /*
    requestAnimationFrame schedules the next
    frame of the game loop.
    It syncs with the screen's refresh rate
    (usually 60fps) for perfectly smooth animation.
    This is much better than setInterval for animation.
  */
  requestAnimationFrame(gameLoop);
}


/* ─────────────────────────────────
   SECTION 14 — START EVERYTHING
   ───────────────────────────────── */

function init() {
  initCharacter();

  /*
    Set the initial position of the player element
    before the game loop starts.
  */
  player.style.left = `${state.x}px`;
  player.style.top  = `${state.y}px`;

  /*
    Start the game loop.
    requestAnimationFrame begins the
    continuous update cycle.
  */
  requestAnimationFrame(gameLoop);

  addLogEntry("Use Arrow Keys or WASD to move.");
}

/* Run init when page is ready */
document.addEventListener("DOMContentLoaded", init);