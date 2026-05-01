/* ================================
   reader.js — The Grand Library
   Fixed version using Gutenberg
   mirror servers which allow CORS
   ================================ */

const CHARS_PER_PAGE = 3000;
const API_BASE       = "https://gutendex.com/books";

/*
  These are official Project Gutenberg mirror servers.
  Unlike the main gutenberg.org, these mirrors
  allow cross-origin requests from browsers.
*/
const MIRRORS = [
  "https://gutenberg.pglaf.org",
  "https://aleph.gutenberg.org",
  "https://gutenberg.readingroo.ms",
];

/*
  We also try these public CORS proxies as a last resort.
  Listed in order of reliability.
*/
const PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${url}`,
];


/* ─────────────────────────────────
   STATE
   ───────────────────────────────── */

const state = {
  bookId:      null,
  bookTitle:   "",
  bookAuthor:  "",
  pages:       [],
  currentPage: 0,
  fontSize:    17,
  theme:       "sepia",
};


/* ─────────────────────────────────
   DOM REFERENCES
   ───────────────────────────────── */

const readerTitle   = document.getElementById("reader-title");
const readerAuthor  = document.getElementById("reader-author");
const sidebarAuthor = document.getElementById("sidebar-author");
const sidebarGenre  = document.getElementById("sidebar-genre");
const sidebarDowns  = document.getElementById("sidebar-downloads");
const sidebarCover  = document.getElementById("sidebar-cover");
const bookText      = document.getElementById("book-text");
const bookContent   = document.getElementById("book-content");
const readerLoading = document.getElementById("reader-loading");
const readerError   = document.getElementById("reader-error");
const errorMsg      = document.getElementById("error-msg");
const prevBtn       = document.getElementById("prev-btn");
const nextBtn       = document.getElementById("next-btn");
const pageIndicator = document.getElementById("page-indicator");
const progressFill  = document.getElementById("progress-fill");
const progressText  = document.getElementById("progress-text");
const fontDisplay   = document.getElementById("font-display");


/* ─────────────────────────────────
   GET BOOK ID FROM URL
   ───────────────────────────────── */

function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}


/* ─────────────────────────────────
   FETCH BOOK METADATA
   This always works — Gutendex
   has proper CORS headers.
   ───────────────────────────────── */

async function fetchBookMetadata(bookId) {
  const response = await fetch(`${API_BASE}/${bookId}`);
  if (!response.ok) throw new Error("Could not load book information.");
  return await response.json();
}


/* ─────────────────────────────────
   BUILD ALL POSSIBLE TEXT URLS
   For a given book ID we build
   every possible URL where the
   plain text might be found.
   ───────────────────────────────── */

function buildTextUrls(bookId, book) {
  const urls = [];

  /*
    First add any URLs the API gave us directly.
    These are the most reliable if they work.
  */
  const formatKeys = [
    "text/plain; charset=utf-8",
    "text/plain; charset=us-ascii",
    "text/plain",
  ];

  for (const key of formatKeys) {
    if (book.formats[key]) {
      urls.push(book.formats[key]);
    }
  }

  /*
    Add mirror server URLs.
    Gutenberg mirrors follow a standard pattern.
    We try all mirrors for the most common filename formats.
  */
  const id   = String(bookId);
  const path = id.split("").slice(0, -1).join("/");

  for (const mirror of MIRRORS) {
    urls.push(`${mirror}/files/${id}/${id}-0.txt`);
    urls.push(`${mirror}/files/${id}/${id}.txt`);
    if (path) {
      urls.push(`${mirror}/${path}/${id}/${id}-0.txt`);
      urls.push(`${mirror}/${path}/${id}/${id}.txt`);
    }
  }

  /*
    Add the standard Gutenberg cache URL patterns.
  */
  urls.push(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`);
  urls.push(`https://www.gutenberg.org/files/${id}/${id}-0.txt`);
  urls.push(`https://www.gutenberg.org/files/${id}/${id}.txt`);

  return urls;
}


/* ─────────────────────────────────
   TRY FETCH WITH TIMEOUT
   Adds a timeout so we don't wait
   forever for a slow/dead server.
   ───────────────────────────────── */

async function fetchWithTimeout(url, timeoutMs = 8000) {
  /*
    AbortController lets us cancel a fetch
    after a certain amount of time.
    This prevents hanging on slow proxies.
  */
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}


/* ─────────────────────────────────
   FETCH BOOK TEXT
   Tries direct URLs first then
   wraps each through proxies.
   ───────────────────────────────── */

async function fetchBookText(book) {
  const bookId  = book.id;
  const allUrls = buildTextUrls(bookId, book);

  /*
    Update the loading message so the user
    knows we are working hard to get their book.
  */
  const loadingEl = document.querySelector(".reader-loading p");
  if (loadingEl) loadingEl.textContent = "Finding the best source for this book...";

  /*
    Strategy 1 — try each URL directly first
    (without any proxy). Some mirror servers
    do allow direct access.
  */
  for (const url of allUrls) {
    try {
      console.log(`Direct attempt: ${url}`);
      const response = await fetchWithTimeout(url, 5000);
      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 500 && !text.includes("<html")) {
          console.log(`Direct fetch SUCCESS: ${url}`);
          return text;
        }
      }
    } catch (e) {
      /* Silently continue to next URL */
    }
  }

  /*
    Strategy 2 — try each URL through each proxy.
    We only try the most reliable URLs through proxies
    to avoid too many requests.
  */
  if (loadingEl) loadingEl.textContent = "Loading book through secure channel...";

  const priorityUrls = allUrls.slice(0, 4);

  for (const proxyFn of PROXIES) {
    for (const url of priorityUrls) {
      try {
        const proxyUrl = proxyFn(url);
        console.log(`Proxy attempt: ${proxyUrl.substring(0, 60)}...`);
        const response = await fetchWithTimeout(proxyUrl, 10000);
        if (response.ok) {
          const text = await response.text();
          if (text && text.length > 500 && !text.includes("<html>")) {
            console.log("Proxy fetch SUCCESS");
            return text;
          }
        }
      } catch (e) {
        /* Silently continue to next combination */
      }
    }
  }

  /*
    Strategy 3 — if all else fails, use the
    Gutenberg HTML version through a proxy and
    strip the HTML tags to get plain text.
    This is a last resort but often works.
  */
  if (loadingEl) loadingEl.textContent = "Trying alternative format...";

  const htmlUrl = book.formats["text/html"]
    || book.formats["application/xhtml+xml"];

  if (htmlUrl) {
    for (const proxyFn of PROXIES) {
      try {
        const proxyUrl = proxyFn(htmlUrl);
        const response = await fetchWithTimeout(proxyUrl, 10000);
        if (response.ok) {
          const html = await response.text();
          if (html && html.length > 500) {
            /*
              Strip HTML tags to get readable plain text.
              This is a simple approach — not perfect but works.
            */
            const stripped = html
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s{3,}/g, "\n\n")
              .trim();

            if (stripped.length > 500) {
              console.log("HTML fallback SUCCESS");
              return stripped;
            }
          }
        }
      } catch (e) {
        /* Continue */
      }
    }
  }

  /*
    All strategies failed.
    Throw a helpful error message.
  */
  throw new Error(
    `Could not load "${book.title}". Project Gutenberg is currently blocking automated access. ` +
    `Please try a different book — some books are more accessible than others.`
  );
}


/* ─────────────────────────────────
   CLEAN THE RAW TEXT
   ───────────────────────────────── */

function cleanBookText(rawText) {
  let text = rawText;

  const startPatterns = [
    /\*{3}\s*START OF (THE PROJECT GUTENBERG|THIS PROJECT GUTENBERG).*?\*{3}/i,
    /\*\*\* START OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/i,
    /\*END\*THE SMALL PRINT/i,
  ];

  for (const pattern of startPatterns) {
    const match = text.match(pattern);
    if (match) {
      text = text.slice(match.index + match[0].length);
      break;
    }
  }

  const endPatterns = [
    /\*{3}\s*END OF (THE PROJECT GUTENBERG|THIS PROJECT GUTENBERG).*?\*{3}/i,
    /\*\*\* END OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/i,
    /End of (the )?Project Gutenberg/i,
  ];

  for (const pattern of endPatterns) {
    const match = text.match(pattern);
    if (match) {
      text = text.slice(0, match.index);
      break;
    }
  }

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}


/* ─────────────────────────────────
   SPLIT INTO PAGES
   ───────────────────────────────── */

function splitIntoPages(text) {
  const pages   = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= CHARS_PER_PAGE) {
      pages.push(remaining.trim());
      break;
    }

    let splitAt = remaining.lastIndexOf("\n\n", CHARS_PER_PAGE);

    if (splitAt === -1 || splitAt < CHARS_PER_PAGE / 2) {
      splitAt = remaining.lastIndexOf(". ", CHARS_PER_PAGE);
    }

    if (splitAt === -1) splitAt = CHARS_PER_PAGE;

    pages.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  return pages;
}


/* ─────────────────────────────────
   FORMAT PAGE AS HTML
   ───────────────────────────────── */

function formatPageAsHtml(text) {
  return text
    .split(/\n\n+/)
    .filter(para => para.trim().length > 0)
    .map(para => `<p>${para.replace(/\n/g, " ").trim()}</p>`)
    .join("");
}


/* ─────────────────────────────────
   RENDER CURRENT PAGE
   ───────────────────────────────── */

function renderCurrentPage() {
  const page       = state.pages[state.currentPage];
  const totalPages = state.pages.length;

  bookText.innerHTML      = formatPageAsHtml(page);
  bookText.style.fontSize = `${state.fontSize}px`;

  document.getElementById("reader-page").scrollTop = 0;

  prevBtn.disabled = state.currentPage === 0;
  nextBtn.disabled = state.currentPage === totalPages - 1;

  pageIndicator.textContent = `Page ${state.currentPage + 1} of ${totalPages.toLocaleString()}`;

  const progress       = Math.round(((state.currentPage + 1) / totalPages) * 100);
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `Page ${state.currentPage + 1} of ${totalPages} · ${progress}%`;
}


/* ─────────────────────────────────
   PAGE NAVIGATION
   ───────────────────────────────── */

function nextPage() {
  if (state.currentPage < state.pages.length - 1) {
    state.currentPage++;
    renderCurrentPage();
    saveProgress();
  }
}

function prevPage() {
  if (state.currentPage > 0) {
    state.currentPage--;
    renderCurrentPage();
    saveProgress();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    nextPage();
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    prevPage();
  }
});


/* ─────────────────────────────────
   SAVE AND RESTORE PROGRESS
   ───────────────────────────────── */

function saveProgress() {
  localStorage.setItem(`reading_progress_${state.bookId}`, state.currentPage);
}

function restoreProgress() {
  const saved = localStorage.getItem(`reading_progress_${state.bookId}`);
  if (saved !== null) state.currentPage = parseInt(saved, 10);
}


/* ─────────────────────────────────
   FONT SIZE CONTROLS
   ───────────────────────────────── */

document.getElementById("font-up").addEventListener("click", () => {
  if (state.fontSize < 24) {
    state.fontSize++;
    fontDisplay.textContent = state.fontSize;
    bookText.style.fontSize = `${state.fontSize}px`;
    localStorage.setItem("reader_font_size", state.fontSize);
  }
});

document.getElementById("font-down").addEventListener("click", () => {
  if (state.fontSize > 13) {
    state.fontSize--;
    fontDisplay.textContent = state.fontSize;
    bookText.style.fontSize = `${state.fontSize}px`;
    localStorage.setItem("reader_font_size", state.fontSize);
  }
});


/* ─────────────────────────────────
   THEME SWITCHING
   ───────────────────────────────── */

document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.body.className = `theme-${btn.dataset.theme}`;
    localStorage.setItem("reader_theme", btn.dataset.theme);
  });
});


/* ─────────────────────────────────
   SHOW / HIDE STATES
   ───────────────────────────────── */

function showLoading() {
  readerLoading.style.display = "flex";
  readerError.style.display   = "none";
  bookContent.style.display   = "none";
}

function showError(message) {
  readerLoading.style.display = "none";
  readerError.style.display   = "flex";
  bookContent.style.display   = "none";
  errorMsg.textContent        = message;
}

function showBook() {
  readerLoading.style.display = "none";
  readerError.style.display   = "none";
  bookContent.style.display   = "block";
}

function retryLoad() {
  init();
}


/* ─────────────────────────────────
   FORMAT AUTHOR NAME
   ───────────────────────────────── */

function formatAuthorName(raw) {
  if (!raw) return "Unknown Author";
  const parts = raw.split(",");
  if (parts.length === 2) return `${parts[1].trim()} ${parts[0].trim()}`;
  return raw;
}


/* ─────────────────────────────────
   MAIN INIT
   ───────────────────────────────── */

async function init() {
  showLoading();

  const savedFont  = localStorage.getItem("reader_font_size");
  const savedTheme = localStorage.getItem("reader_theme");

  if (savedFont) {
    state.fontSize          = parseInt(savedFont, 10);
    fontDisplay.textContent = state.fontSize;
  }

  if (savedTheme) {
    document.body.className = `theme-${savedTheme}`;
    document.querySelectorAll(".theme-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.theme === savedTheme);
    });
  }

  state.bookId = getBookIdFromUrl();

  if (!state.bookId) {
    showError("No book selected. Please go back to the library and click Read Now.");
    return;
  }

  try {
    /* Fetch metadata */
    const book = await fetchBookMetadata(state.bookId);

    state.bookTitle  = book.title;
    state.bookAuthor = book.authors[0]
      ? formatAuthorName(book.authors[0].name)
      : "Unknown Author";

    readerTitle.textContent   = book.title;
    readerAuthor.textContent  = state.bookAuthor;
    sidebarAuthor.textContent = state.bookAuthor;
    sidebarGenre.textContent  = book.subjects[0]
      ? book.subjects[0].replace(/\s*--\s*Fiction/gi, "").trim()
      : "Classic";
    sidebarDowns.textContent  = book.download_count.toLocaleString() + " downloads";
    document.title            = `${book.title} — The Grand Library`;

    const coverUrl = book.formats["image/jpeg"];
    if (coverUrl) {
      sidebarCover.src     = coverUrl;
      sidebarCover.onerror = () => { sidebarCover.style.display = "none"; };
      document.getElementById("cover-placeholder").style.display = "none";
    }

    /* Fetch full book text */
    const rawText   = await fetchBookText(book);
    const cleanText = cleanBookText(rawText);
    state.pages     = splitIntoPages(cleanText);

    restoreProgress();
    state.currentPage = Math.min(state.currentPage, state.pages.length - 1);

    showBook();
    renderCurrentPage();
    nextBtn.disabled = state.pages.length <= 1;

  } catch (error) {
    console.error("Reader error:", error);
    showError(error.message);
  }
}

document.addEventListener("DOMContentLoaded", init);