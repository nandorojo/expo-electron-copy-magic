import { useState, useReducer, useMemo } from 'react'
import { HistoryItem, isHistoryImage } from './use-clipboard'
import moment from 'moment'

/**
 * Hook used to filter results.
 *
 * Enables search,
 */
export const useSearch = ({ history }: { history: HistoryItem[] }) => {
  const [query, setQuery] = useState('')

  const [showImages, toggleShowImages] = useReducer(show => !show, true)

  const [showText, toggleShowText] = useReducer(show => !show, true)

  const filteredHistory = useMemo(() => {
    return history.filter(copied => {
      // check if they typed text that's in this date
      const isInDate =
        copied.copiedAt &&
        (moment(copied.copiedAt)
          .calendar()
          .toLowerCase()
          .includes(query.trim().toLowerCase()) ||
          copied.copiedAt.includes(query.trim().toLowerCase()))

      // if this is an image...
      if (isHistoryImage(copied)) {
        if (!showImages) return false

        // also query the image URL, just in case
        const isInUrl = copied.value.url
          .toLowerCase()
          .includes(query.trim().toLowerCase())
        return isInDate || isInUrl
      }

      if (!showText) return false

      // check if the copied text includes the typed text
      const isInText = copied.value
        .toLowerCase()
        .trim()
        .includes(query.trim().toLowerCase())

      return isInDate || isInText
    })
  }, [history, query, showImages, showText])

  return {
    query,
    setQuery,
    showText,
    showImages,
    toggleShowText,
    toggleShowImages,
    filteredHistory,
    isEmptyQuery: query.trim() && !filteredHistory.length,
    isEmptyList: !history.length,
  }
}
