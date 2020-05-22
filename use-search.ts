import { useState } from 'react'

export const useSearch = () => {
  const [query, setQuery] = useState('')

  return {
    query,
    setQuery,
  }
}
