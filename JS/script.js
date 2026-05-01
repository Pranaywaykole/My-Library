/* ================================
   script.js — The Grand Library
   Complete file — Phase 2 Lesson 10
   ================================ */


/* ─────────────────────────────────
   SECTION 1 — API CONFIGURATION
   ───────────────────────────────── */

const API_BASE = "https://gutendex.com/books";
const BOOKS_PER_PAGE = 32;


/* ─────────────────────────────────
   SECTION 2 — APPLICATION STATE
   ───────────────────────────────── */

const state = {
  searchTerm:   "",
  currentTopic: "",
  currentPage:  1,
  totalBooks:   0,
  nextPageUrl:  null,
  prevPageUrl:  null,
  isLoading:    false,
};


/* ─────────────────────────────────
   SECTION 3 — DOM REFERENCES
   ───────────────────────────────── */

const booksContainer    = document.querySelector(".books-container");
const searchInput       = document.querySelector("#book-search");
const floatingCharacter = document.querySelector(".floating-character");
const enterBtn          = document.querySelector(".btn-primary");


/* ─────────────────────────────────
   SECTION 4 — FETCH BOOKS
   Core async function that talks
   to the Gutenberg API.
   ───────────────────────────────── */

async function fetchBooks(url) {
  if (state.isLoading) return;
  state.isLoading = true;

  showLoadingState();

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    state.totalBooks  = data.count;
    state.nextPageUrl = data.next;
    state.prevPageUrl = data.previous;

    renderBooks(data.results);
    renderPagination();
    updateResultsCount(data.count);

  } catch (error) {
    showErrorState(error.message);
    console.error("Failed to fetch books:", error);

  } finally {
    state.isLoading = false;
  }
}


/* ─────────────────────────────────
   SECTION 5 — BUILD API URL
   Constructs the correct URL based
   on search term, topic, and page.
   ───────────────────────────────── */

function buildApiUrl() {
  const params = new URLSearchParams();

  if (state.searchTerm)   params.set("search", state.searchTerm);
  if (state.currentTopic) params.set("topic",  state.currentTopic);
  if (state.currentPage > 1) params.set("page", state.currentPage);

  const queryString = params.toString();
  return queryString ? `${API_BASE}?${queryString}` : API_BASE;
}


/* ─────────────────────────────────
   SECTION 6 — RENDER BOOKS
   Takes the array of book objects
   from the API and creates HTML cards.
   ───────────────────────────────── */

function renderBooks(books) {
  if (!books || books.length === 0) {
    booksContainer.innerHTML = `
      <div class="no-results">
        <p>No books found.</p>
        <p>Try a different search term or topic.</p>
      </div>
    `;
    return;
  }

  booksContainer.innerHTML = books
    .map(book => createBookCard(book))
    .join("");
}

function createBookCard(book) {
  /*
    Format author name from "Last, First" to "First Last"
  */
  const authorRaw = book.authors[0]?.name || "Unknown Author";
  const author    = formatAuthorName(authorRaw);

  /*
    Get cover image — use placeholder if missing
  */
  const coverUrl = book.formats["image/jpeg"]
    || `https://via.placeholder.com/100x150/1a1a2e/c9a84c?text=${encodeURIComponent(book.title.charAt(0))}`;

  /*
    Get genre from subjects array — clean it up
  */
  const subject = book.subjects[0]
    ? book.subjects[0].replace(/\s*--\s*Fiction/gi, "").trim()
    : "Classic";

  const genreDisplay = subject.length > 20
    ? subject.substring(0, 18) + "..."
    : subject;

  /*
    Popular badge for highly downloaded books
  */
  const isPopular = book.download_count > 10000;
  const badge     = isPopular
    ? `<span class="card-badge">Popular</span>`
    : "";

  return `
    <div class="book-card">
      ${badge}
      <img
        src="${coverUrl}"
        alt="Cover of ${book.title}"
        onerror="this.src='https://via.placeholder.com/100x150/1a1a2e/c9a84c?text=Book'"
      >
      <h3>${truncateText(book.title, 40)}</h3>
      <p class="author">By ${author}</p>
      <span class="genre-tag">${genreDisplay}</span>
      <button onclick="openBook(${book.id})">Read Now</button>
    </div>
  `;
}


/* ─────────────────────────────────
   SECTION 7 — HELPER FUNCTIONS
   ───────────────────────────────── */

/*
  Convert "Austen, Jane" → "Jane Austen"
*/
function formatAuthorName(raw) {
  if (!raw) return "Unknown Author";
  const parts = raw.split(",");
  if (parts.length === 2) {
    return `${parts[1].trim()} ${parts[0].trim()}`;
  }
  return raw;
}

/*
  Truncate long titles with ellipsis
*/
function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength
    ? text.substring(0, maxLength) + "..."
    : text;
}

/*
  Update the results count display
*/
function updateResultsCount(count) {
  const countEl = document.querySelector(".results-count");
  if (countEl) {
    countEl.textContent = `${count.toLocaleString()} books found`;
  }
}


/* ─────────────────────────────────
   SECTION 8 — LOADING AND ERROR STATES
   ───────────────────────────────── */

function showLoadingState() {
  /*
    Show 8 skeleton placeholder cards
    while real books are loading.
    This is called a skeleton loader —
    used by Facebook, YouTube, LinkedIn.
  */
  const skeletons = Array(8).fill(0).map(() => `
    <div class="book-card skeleton">
      <div class="skeleton-img"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
      <div class="skeleton-badge"></div>
      <div class="skeleton-btn"></div>
    </div>
  `).join("");

  booksContainer.innerHTML = skeletons;
}

function showErrorState(message) {
  booksContainer.innerHTML = `
    <div class="error-state">
      <p class="error-icon">📚</p>
      <p class="error-title">Could not load books</p>
      <p class="error-message">${message}</p>
      <button onclick="retryFetch()" class="retry-btn">Try Again</button>
    </div>
  `;
}

function retryFetch() {
  fetchBooks(buildApiUrl());
}


/* ─────────────────────────────────
   SECTION 9 — PAGINATION
   Next / Previous page buttons.
   ───────────────────────────────── */

function renderPagination() {
  let paginationEl = document.querySelector(".pagination");

  if (!paginationEl) {
    paginationEl = document.createElement("div");
    paginationEl.classList.add("pagination");
    booksContainer.after(paginationEl);
  }

  if (state.totalBooks <= BOOKS_PER_PAGE) {
    paginationEl.innerHTML = "";
    return;
  }

  const totalPages  = Math.ceil(state.totalBooks / BOOKS_PER_PAGE);
  const hasPrevious = state.currentPage > 1;
  const hasNext     = state.currentPage < totalPages;

  paginationEl.innerHTML = `
    <div class="pagination-inner">
      <button
        class="page-btn prev-btn"
        ${!hasPrevious ? "disabled" : ""}
        onclick="goToPrevPage()"
      >
        ← Previous
      </button>

      <span class="page-info">
        Page ${state.currentPage} of ${totalPages.toLocaleString()}
      </span>

      <button
        class="page-btn next-btn"
        ${!hasNext ? "disabled" : ""}
        onclick="goToNextPage()"
      >
        Next →
      </button>
    </div>
  `;
}

function goToNextPage() {
  if (!state.nextPageUrl) return;
  state.currentPage++;
  document.querySelector(".books-section").scrollIntoView({ behavior: "smooth" });
  fetchBooks(state.nextPageUrl);
}

function goToPrevPage() {
  if (!state.prevPageUrl) return;
  state.currentPage--;
  document.querySelector(".books-section").scrollIntoView({ behavior: "smooth" });
  fetchBooks(state.prevPageUrl);
}


/* ─────────────────────────────────
   SECTION 10 — SEARCH
   Debounced search — waits for user
   to stop typing before fetching.
   ───────────────────────────────── */

/*
  debounce prevents a function firing
  too many times in quick succession.

  Without debounce: user types "sherlock"
  = 8 separate API calls.

  With debounce: user types "sherlock"
  = 1 API call, 500ms after they stop.
*/
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const debouncedSearch = debounce(() => {
  state.searchTerm  = searchInput ? searchInput.value.trim() : "";
  state.currentPage = 1;
  fetchBooks(buildApiUrl());
}, 500);

function setupSearch() {
  if (!searchInput) return;

  searchInput.addEventListener("input", debouncedSearch);

  /*
    Enter key searches immediately
    without waiting for the debounce delay.
  */
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      state.searchTerm  = searchInput.value.trim();
      state.currentPage = 1;
      fetchBooks(buildApiUrl());
    }
  });
}


/* ─────────────────────────────────
   SECTION 11 — GENRE FILTERS
   ───────────────────────────────── */

function setupGenreFilters() {
  const filterButtons = document.querySelectorAll(".genre-filter");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const topic = button.dataset.topic;
      state.currentTopic = topic === "all" ? "" : topic;
      state.currentPage  = 1;

      /*
        Clear search box when genre filter clicked
        so they do not conflict with each other.
      */
      if (searchInput) searchInput.value = "";
      state.searchTerm = "";

      fetchBooks(buildApiUrl());
    });
  });
}


/* ─────────────────────────────────
   SECTION 12 — OPEN BOOK
   Navigates to reader.html with
   the book ID in the URL.
   The reader page fetches and
   displays the full book text.
   ───────────────────────────────── */

function openBook(bookId) {
  /*
    We pass the book ID as a URL parameter.
    reader.html reads this and fetches the book.
    No modal, no redirect to Gutenberg —
    the full book opens inside your library.
  */
  window.location.href = `reader.html?id=${bookId}`;
}


/* ─────────────────────────────────
   SECTION 13 — CHARACTER SELECTION
   Clicking a character card selects
   it and saves the choice.
   ───────────────────────────────── */

function setupCharacterSelection() {
  const characterCards = document.querySelectorAll(".character-card");

  characterCards.forEach((card) => {
    card.addEventListener("click", () => {
      characterCards.forEach(c => c.classList.remove("selected-character"));
      card.classList.add("selected-character");

      const characterName  = card.querySelector("h3").textContent;
      const characterEmoji = card.querySelector(".character-avatar").textContent;

      if (floatingCharacter) {
        floatingCharacter.textContent = `${characterEmoji} ${characterName}`;
      }

      localStorage.setItem("chosenCharacter", characterName);
      localStorage.setItem("chosenEmoji",     characterEmoji);

      showNotification(`You are now playing as ${characterName}!`);
    });
  });

  /*
    On page load restore the character
    the user previously chose.
  */
  const savedCharacter = localStorage.getItem("chosenCharacter");
  const savedEmoji     = localStorage.getItem("chosenEmoji");

  if (savedCharacter && savedEmoji && floatingCharacter) {
    floatingCharacter.textContent = `${savedEmoji} ${savedCharacter}`;
  }
}


/* ─────────────────────────────────
   SECTION 14 — NOTIFICATIONS
   Small toast that slides in from
   the top and disappears after 3s.
   ───────────────────────────────── */

function showNotification(message) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("notification-hide");
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}


/* ─────────────────────────────────
   SECTION 15 — ENTER LIBRARY BUTTON
   Clicking Enter Library takes the
   user straight into the room.
   ───────────────────────────────── */

function setupEnterButton() {
  if (!enterBtn) return;

  enterBtn.addEventListener("click", () => {
    window.location.href = "../room.html";
  });
}


/* ─────────────────────────────────
   SECTION 16 — INITIALISE
   Runs everything when page loads.
   ───────────────────────────────── */

async function init() {
  setupSearch();
  setupGenreFilters();
  setupCharacterSelection();
  setupEnterButton();

  /*
    Fetch the first page of books
    as soon as the page loads.
  */
  await fetchBooks(API_BASE);

  console.log("The Grand Library is ready with real books!");
}

/*
  Wait for all HTML to be fully loaded
  before running our init function.
*/
document.addEventListener("DOMContentLoaded", init);