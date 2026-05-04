import { useState, useEffect } from 'react'

const API_BASE = "https://gutendex.com/books"

export function useBooks(searchTerm, topic, page) {
  const [books,   setBooks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [total,   setTotal]   = useState(0)
  const [nextUrl, setNextUrl] = useState(null)
  const [prevUrl, setPrevUrl] = useState(null)

  useEffect(() => {
    /*
      cancelled flag prevents a stale fetch from
      updating state after the component unmounts
      or the effect re-runs with new dependencies.
      This prevents the React warning:
      "Can't perform state update on unmounted component"
    */
    let cancelled = false

    async function fetchBooks() {
      setLoading(true)
      setError(null)

      try {
        /* Build the URL from current parameters */
        const params = new URLSearchParams()
        if (searchTerm) params.set("search", searchTerm)
        if (topic)      params.set("topic",  topic)
        if (page > 1)   params.set("page",   page)

        const qs  = params.toString()
        const url = qs ? `${API_BASE}?${qs}` : API_BASE

        const response = await fetch(url)
        if (!response.ok) throw new Error(`API error: ${response.status}`)

        const data = await response.json()

        if (!cancelled) {
          setBooks(data.results)
          setTotal(data.count)
          setNextUrl(data.next)
          setPrevUrl(data.previous)
        }

      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    /*
      Debounce — only delay when there is a search term.
      Genre filter and page changes happen instantly.
    */
    const delay = searchTerm ? 500 : 0
    const timer = setTimeout(fetchBooks, delay)

    /* Cleanup — cancel timer and mark as cancelled */
    return () => {
      cancelled = true
      clearTimeout(timer)
    }

  }, [searchTerm, topic, page])

  return { books, loading, error, total, nextUrl, prevUrl }
}