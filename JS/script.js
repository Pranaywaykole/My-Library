/* ================================
   YOUR LIBRARY — script.js
   Phase 1 Lesson 8
   ================================ */


/* ─────────────────────────────────
   STEP 1 — THE BOOK DATA
   This is your library's book database.
   Each book is an object with properties.
   All books live in one array.
   ───────────────────────────────── */

const books = [
  {
    title: "Sherlock Holmes",
    author: "Arthur Conan Doyle",
    genre: "Mystery",
    year: 1887,
    badge: "Popular"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    year: 1813,
    badge: "New"
  },
  {
    title: "Treasure Island",
    author: "Robert Louis Stevenson",
    genre: "Adventure",
    year: 1883,
    badge: "Classic"
  },
  {
    title: "Moby Dick",
    author: "Herman Melville",
    genre: "Adventure",
    year: 1851,
    badge: ""
  },
  {
    title: "Dracula",
    author: "Bram Stoker",
    genre: "Horror",
    year: 1897,
    badge: "Classic"
  },
  {
    title: "Frankenstein",
    author: "Mary Shelley",
    genre: "Horror",
    year: 1818,
    badge: ""
  }
];


/* ─────────────────────────────────
   STEP 2 — SELECT DOM ELEMENTS
   We grab references to the HTML
   elements we need to work with.
   We do this once at the top and
   reuse these variables throughout.
   ───────────────────────────────── */

/*
  We select the books container — the div that
  holds all the book cards. We will inject
  HTML into this whenever we need to display books.
*/
const booksContainer = document.querySelector(".books-container");

/*
  The enter library button in the hero section.
  We will make this do something when clicked.
*/
const enterBtn = document.querySelector(".btn-primary");

/*
  The floating character indicator at the bottom right.
  We will update this to show the user's character name.
*/
const floatingCharacter = document.querySelector(".floating-character");


/* ─────────────────────────────────
   STEP 3 — A FUNCTION TO CREATE
   ONE BOOK CARD AS HTML
   
   This function takes one book object
   and returns an HTML string for that card.
   We use a template literal so we can
   embed the book's properties directly.
   ───────────────────────────────── */

function createBookCard(book) {
  /*
    We check if the book has a badge.
    If it does, we create the badge HTML.
    If not, we use an empty string.
    This is called a ternary operator:
    condition ? valueIfTrue : valueIfFalse
  */
  const badgeHTML = book.badge
    ? `<span class="card-badge">${book.badge}</span>`
    : "";

  /*
    We choose a badge class based on the badge text.
    "New" gets green, "Classic" gets purple, others get gold.
  */
  const badgeClass = book.badge === "New"
    ? "card-badge new-badge"
    : book.badge === "Classic"
    ? "card-badge classic-badge"
    : "card-badge";

  /*
    The full badge HTML with the correct class
  */
  const badge = book.badge
    ? `<span class="${badgeClass}">${book.badge}</span>`
    : "";

  /*
    We return the complete HTML string for one book card.
    Notice how we embed book.title, book.author etc
    directly into the template literal using ${}.
    This is exactly the same HTML structure as your
    hand-written cards, but now generated from data.
  */
  return `
    <div class="book-card">
      ${badge}
      <img
        src="https://via.placeholder.com/100x150/1a1a2e/c9a84c?text=${book.title.charAt(0)}${book.title.charAt(1)}"
        alt="Cover of ${book.title}"
      >
      <h3>${book.title}</h3>
      <p class="author">By ${book.author}</p>
      <span class="genre-tag">${book.genre}</span>
      <button onclick="openBook('${book.title}')">Read Now</button>
    </div>
  `;
}


/* ─────────────────────────────────
   STEP 4 — A FUNCTION TO DISPLAY
   ALL BOOKS IN THE CONTAINER
   
   This takes an array of books and
   renders them all into the page.
   ───────────────────────────────── */

function displayBooks(booksToShow) {
  /*
    map() transforms each book object into an HTML string.
    join("") combines all those strings into one big string.
    We then set that as the innerHTML of the container —
    replacing whatever was there before with the new cards.
  */
  booksContainer.innerHTML = booksToShow
    .map((book) => createBookCard(book))
    .join("");
}


/* ─────────────────────────────────
   STEP 5 — SEARCH FUNCTIONALITY
   
   We will add a search bar to your
   HTML. When the user types in it,
   we filter the books array and
   redisplay only matching books.
   ───────────────────────────────── */

function setupSearch() {
  /*
    We select the search input we are about to add to HTML.
    If it does not exist yet, we return early.
  */
  const searchInput = document.querySelector("#book-search");
  if (!searchInput) return;

  /*
    Every time the user types a character, this runs.
    "input" event fires on every single keystroke.
  */
  searchInput.addEventListener("input", () => {
    /*
      We get the current value of the search box,
      convert to lowercase for case-insensitive matching,
      and trim whitespace from start and end.
    */
    const searchTerm = searchInput.value.toLowerCase().trim();

    /*
      If search box is empty, show all books.
      Otherwise filter to matching books only.
    */
    if (searchTerm === "") {
      displayBooks(books);
      return;
    }

    /*
      filter() checks each book — does its title or
      author include the search term?
      includes() checks if a string contains another string.
      We lowercase everything so "sherlock" matches "Sherlock".
    */
    const filteredBooks = books.filter((book) => {
      const titleMatch  = book.title.toLowerCase().includes(searchTerm);
      const authorMatch = book.author.toLowerCase().includes(searchTerm);
      const genreMatch  = book.genre.toLowerCase().includes(searchTerm);
      return titleMatch || authorMatch || genreMatch;
    });

    /*
      If no books match, show a friendly message.
      Otherwise display the filtered results.
    */
    if (filteredBooks.length === 0) {
      booksContainer.innerHTML = `
        <div style="text-align:center; padding: 40px; color: #888; width:100%;">
          <p style="font-size:18px;">No books found for "${searchInput.value}"</p>
          <p style="font-size:14px; margin-top:8px;">Try searching by title, author, or genre</p>
        </div>
      `;
    } else {
      displayBooks(filteredBooks);
    }
  });
}


/* ─────────────────────────────────
   STEP 6 — GENRE FILTER BUTTONS
   
   Clicking a genre shows only
   books of that genre.
   ───────────────────────────────── */

function setupGenreFilters() {
  /*
    querySelectorAll returns all elements with class genre-filter.
    We will add these buttons to our HTML shortly.
  */
  const filterButtons = document.querySelectorAll(".genre-filter");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      /*
        Remove active class from all buttons first.
        Then add it only to the clicked one.
        This highlights the selected genre.
      */
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      /*
        The data-genre attribute on the button tells us
        which genre was selected. "all" means show everything.
      */
      const selectedGenre = button.dataset.genre;

      if (selectedGenre === "all") {
        displayBooks(books);
      } else {
        const filtered = books.filter(
          (book) => book.genre === selectedGenre
        );
        displayBooks(filtered);
      }
    });
  });
}


/* ─────────────────────────────────
   STEP 7 — OPEN BOOK FUNCTION
   
   When Read Now is clicked this
   shows a simple reading modal.
   ───────────────────────────────── */

function openBook(title) {
  /*
    Find the book object that matches the clicked title.
    find() returns the first array item where condition is true.
  */
  const book = books.find((b) => b.title === title);
  if (!book) return;

  /*
    Create a modal overlay that covers the page.
    We inject this HTML into the body.
  */
  const modal = document.createElement("div");
  modal.classList.add("book-modal");

  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="closeBook()">✕ Close</button>
      <h2>${book.title}</h2>
      <p class="modal-author">By ${book.author} · ${book.year}</p>
      <span class="genre-tag">${book.genre}</span>
      <div class="modal-body">
        <p>You are now reading <strong>${book.title}</strong>.</p>
        <p style="margin-top:16px; color:#888; font-style:italic;">
          In the full version of this library, the complete text of this
          book will be fetched from Project Gutenberg and displayed here
          for free reading. This is the reading room experience!
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  /*
    Prevent the background from scrolling while modal is open.
  */
  document.body.style.overflow = "hidden";
}

function closeBook() {
  const modal = document.querySelector(".book-modal");
  if (modal) {
    modal.remove();
    document.body.style.overflow = "";
  }
}


/* ─────────────────────────────────
   STEP 8 — CHARACTER SELECTION
   
   Clicking a character card selects
   that character and updates the
   floating indicator at the bottom.
   ───────────────────────────────── */

function setupCharacterSelection() {
  const characterCards = document.querySelectorAll(".character-card");

  characterCards.forEach((card) => {
    card.addEventListener("click", () => {
      /*
        Remove selected state from all cards first.
      */
      characterCards.forEach((c) => c.classList.remove("selected-character"));

      /*
        Add selected state to the clicked card.
      */
      card.classList.add("selected-character");

      /*
        Read the character name from the h3 inside the card.
      */
      const characterName = card.querySelector("h3").textContent;

      /*
        Read the emoji avatar from the character-avatar div.
      */
      const characterEmoji = card.querySelector(".character-avatar").textContent;

      /*
        Update the floating indicator to show the chosen character.
        Store the character in localStorage so it persists on refresh.
      */
      floatingCharacter.textContent = `${characterEmoji} ${characterName}`;
      localStorage.setItem("chosenCharacter", characterName);
      localStorage.setItem("chosenEmoji", characterEmoji);

      /*
        Show a small confirmation message.
      */
      showNotification(`You are now playing as ${characterName}!`);
    });
  });

  /*
    On page load, check if user already chose a character
    and restore their selection.
  */
  const savedCharacter = localStorage.getItem("chosenCharacter");
  const savedEmoji     = localStorage.getItem("chosenEmoji");

  if (savedCharacter && savedEmoji) {
    floatingCharacter.textContent = `${savedEmoji} ${savedCharacter}`;
  }
}


/* ─────────────────────────────────
   STEP 9 — NOTIFICATION SYSTEM
   
   A small toast notification that
   slides in from the top and
   disappears after a few seconds.
   ───────────────────────────────── */

function showNotification(message) {
  /*
    Create a new div element in JavaScript.
    document.createElement creates a real DOM element
    that is not yet attached to the page.
  */
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;

  /*
    Attach it to the body — now it appears on screen.
  */
  document.body.appendChild(notification);

  /*
    setTimeout runs a function after a delay in milliseconds.
    3000ms = 3 seconds. After 3 seconds we start fading it out.
  */
  setTimeout(() => {
    notification.classList.add("notification-hide");

    /*
      After the fade out animation (0.4s), remove the element
      from the DOM entirely so it does not pile up.
    */
    setTimeout(() => {
      notification.remove();
    }, 400);
  }, 3000);
}


/* ─────────────────────────────────
   STEP 10 — ENTER LIBRARY BUTTON
   
   Clicking the main CTA button
   scrolls smoothly to the books
   section. Later it will open the
   full library room.
   ───────────────────────────────── */

function setupEnterButton() {
  if (!enterBtn) return;

  enterBtn.addEventListener("click", () => {
    const booksSection = document.querySelector(".books-section");

    /*
      scrollIntoView scrolls the page so the element becomes visible.
      behavior: "smooth" makes it animate smoothly instead of jumping.
    */
    booksSection.scrollIntoView({ behavior: "smooth" });

    showNotification("Welcome to The Grand Library. Choose a book to begin!");
  });
}


/* ─────────────────────────────────
   STEP 11 — INITIALISE EVERYTHING
   
   This function runs all our setup
   functions when the page first loads.
   We call it at the very bottom.
   ───────────────────────────────── */

function init() {
  displayBooks(books);
  setupSearch();
  setupGenreFilters();
  setupCharacterSelection();
  setupEnterButton();

  console.log("The Grand Library is ready!");
  console.log(`Total books loaded: ${books.length}`);
}

/*
  This event fires when the entire HTML page has
  finished loading. We wait for this before running
  our init function to make sure all elements exist.
*/
document.addEventListener("DOMContentLoaded", init);