import clipboardSubscription from 'electron-clipboard-extended'
import { clipboard } from 'electron'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Store from 'electron-store'

const store = new Store({ accessPropertiesByDotNotation: true, watch: true })

const STORAGE_KEY = 'clipboard-history'

type HistoryItem =
  | {
      type: 'text'
      item: string
    }
  | {
      type: 'image'
      item: string
    }

type Options = {
  query: string
}

export const useClipboard = ({ query }: Options) => {
  const [history, setHistory] = useState<HistoryItem[]>(
    store.get(STORAGE_KEY) ?? []
  )

  useEffect(() => {
    clipboardSubscription
      .on('text-changed', () => {
        const justCopied = clipboardSubscription.readText()
        if (!justCopied) return
        const previouslyCopied = store.get(STORAGE_KEY) ?? []

        // add the recently-copied item
        store.set(STORAGE_KEY, [
          { type: 'text', item: justCopied },
          ...previouslyCopied,
        ])
      })
      .on('image-changed', () => {
        const justCopied = clipboard.readImage()
        if (!justCopied) return
        const previouslyCopied = store.get(STORAGE_KEY) ?? []
        console.log('[use-clipboard][image-changed]', { justCopied })

        // add the recently-copied item
        store.set(STORAGE_KEY, [
          { type: 'image', item: justCopied.toDataURL() },
          ...previouslyCopied,
        ])
      })
      .startWatching()
    return () => {
      clipboardSubscription.off('text-changed')
      clipboardSubscription.off('image-changed')
    }
  }, [])

  useEffect(() => {
    const unsubscribe = store.onDidChange(STORAGE_KEY, (newValue, oldValue) => {
      console.log('[use-clipboard] updated', STORAGE_KEY, {
        newValue,
        oldValue,
      })
      if (newValue) setHistory(newValue)
      //   else setHistory([])
    })
    return () => unsubscribe()
  }, [])

  const clearHistory = useCallback(() => {
    store.set(STORAGE_KEY, [])
  }, [])

  const filteredHistory = useMemo(() => {
    if (!query.trim()) return history

    return history.filter(({ type, item }) => {
      if (type !== 'text') return false

      return item.toLowerCase().includes(query.trim())
    })
  }, [history, query])

  return {
    history,
    clearHistory,
    isEmptyQuery: query.trim() && !filteredHistory.length,
  }
}
