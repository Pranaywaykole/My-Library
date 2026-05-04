import { useState, useEffect } from 'react'

const API_BASE      = "https://gutendex.com/books"
const CHARS_PER_PAGE = 3000

const PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${url}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
]

export function useReader(bookId) {
  const [book,        setBook]        = useState(null)
  const [pages,       setPages]       = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [loadingText, setLoadingText] = useState("Fetching book details...")

  useEffect(() => {
    if (!bookId) {
      setError("No book selected.")
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadBook() {
      setLoading(true)
      setError(null)

      try {
        /* Step 1 — fetch metadata */
        setLoadingText("Fetching book details...")
        const metaRes = await fetch(`${API_BASE}/${bookId}`)
        if (!metaRes.ok) throw new Error("Could not load book information.")
        const bookData = await metaRes.json()

        if (!cancelled) setBook(bookData)

        /* Step 2 — fetch full text */
        setLoadingText("Loading full book text...")
        const text = await fetchBookText(bookData)

        if (!cancelled) {
          const clean    = cleanText(text)
          const allPages = splitPages(clean)
          setPages(allPages)

          /* Restore reading progress */
          const saved = localStorage.getItem(`progress_${bookId}`)
          if (saved) {
            setCurrentPage(Math.min(parseInt(saved), allPages.length - 1))
          }
        }

      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadBook()
    return () => { cancelled = true }

  }, [bookId])

  function goToNext() {
    if (currentPage < pages.length - 1) {
      const next = currentPage + 1
      setCurrentPage(next)
      localStorage.setItem(`progress_${bookId}`, next)
    }
  }

  function goToPrev() {
    if (currentPage > 0) {
      const prev = currentPage - 1
      setCurrentPage(prev)
      localStorage.setItem(`progress_${bookId}`, prev)
    }
  }

  return {
    book, pages, currentPage,
    loading, error, loadingText,
    goToNext, goToPrev,
  }
}

/* ── Helpers ── */

async function fetchBookText(book) {
  const formats = [
    "text/plain; charset=utf-8",
    "text/plain; charset=us-ascii",
    "text/plain",
  ]

  const urls = []
  for (const f of formats) {
    if (book.formats[f]) urls.push(book.formats[f])
  }
  urls.push(`https://www.gutenberg.org/cache/epub/${book.id}/pg${book.id}.txt`)
  urls.push(`https://www.gutenberg.org/files/${book.id}/${book.id}-0.txt`)

  for (const url of urls) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const text = await res.text()
        if (text.length > 500) return text
      }
    } catch { /* try next */ }
  }

  for (const proxyFn of PROXIES) {
    for (const url of urls.slice(0, 3)) {
      try {
        const res = await fetch(proxyFn(url))
        if (res.ok) {
          const text = await res.text()
          if (text.length > 500) return text
        }
      } catch { /* try next */ }
    }
  }

  throw new Error(
    "Could not load book text. Try a different book — some are more accessible than others."
  )
}

function cleanText(raw) {
  let text = raw
  const start = raw.match(/\*{3}\s*START OF.*?\*{3}/i)
  if (start) text = text.slice(start.index + start[0].length)
  const end = text.match(/\*{3}\s*END OF.*?\*{3}/i)
  if (end) text = text.slice(0, end.index)
  return text.replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim()
}

function splitPages(text) {
  const pages   = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= CHARS_PER_PAGE) {
      pages.push(remaining.trim())
      break
    }
    let splitAt = remaining.lastIndexOf("\n\n", CHARS_PER_PAGE)
    if (splitAt === -1 || splitAt < CHARS_PER_PAGE / 2) {
      splitAt = remaining.lastIndexOf(". ", CHARS_PER_PAGE)
    }
    if (splitAt === -1) splitAt = CHARS_PER_PAGE
    pages.push(remaining.slice(0, splitAt).trim())
    remaining = remaining.slice(splitAt).trim()
  }
  return pages
}