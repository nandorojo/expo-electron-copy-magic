import clipboardSubscription from '@nandorojo/electron-clipboard'
import { clipboard, nativeImage } from 'electron'
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Store from 'electron-store'
import moment from 'moment'
import { FlatList } from 'react-native'

const store = new Store({ accessPropertiesByDotNotation: true, watch: true })

const STORAGE_KEY = 'clipboard-history'

export type HistoryItemImage = {
  type: 'image'
  value: {
    url: string
    height: number
    width: number
  }
  copiedAt?: string
}

type HistoryImageText = {
  type: 'text'
  value: string
  copiedAt?: string
}

// this looks weird, but it helps Typescript deal with the two differing "value" types
export function isHistoryImage(
  copied: HistoryItem
): copied is HistoryItemImage {
  return (
    !!((copied as HistoryItemImage).type === 'image') &&
    !!(copied as HistoryItemImage)?.value?.url
  )
}
export type HistoryItem = HistoryImageText | HistoryItemImage

// type Options = {
//   query: string
// }

export const useClipboard = () => {
  const [history, setHistory] = useState<HistoryItem[]>(
    store.get(STORAGE_KEY) ?? []
  )
  const flatlist = useRef<FlatList<HistoryItem>>(null)

  useEffect(() => {
    const subscription = clipboardSubscription
      .on('text-changed', () => {
        const justCopied = clipboardSubscription.readText()
        if (!justCopied || !justCopied.trim()) return
        const previouslyCopied = store.get(STORAGE_KEY) ?? []

        // add the recently-copied value
        store.set(STORAGE_KEY, [
          {
            type: 'text',
            value: justCopied,
            copiedAt: new Date().toString(),
          },
          ...previouslyCopied,
        ])
      })
      .on('image-changed', () => {
        const justCopied = clipboard.readImage()
        if (!justCopied) return
        const previouslyCopied = store.get(STORAGE_KEY) ?? []
        console.log('[use-clipboard][image-changed]', { justCopied })

        // add the recently-copied value
        store.set(STORAGE_KEY, [
          {
            type: 'image',
            value: { url: justCopied.toDataURL(), ...justCopied.getSize() },
            copiedAt: new Date().toString(),
          },
          ...previouslyCopied,
        ])
      })
      .startWatching()
    return () => {
      clipboardSubscription.off('text-changed', subscription)
      clipboardSubscription.off('image-changed', subscription)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = store.onDidChange(STORAGE_KEY, (newValue, oldValue) => {
      console.log('[use-clipboard] updated', STORAGE_KEY, {
        newValue,
        oldValue,
      })
      if (newValue) {
        flatlist.current?.scrollToOffset({ offset: 0, animated: true })
        setHistory(newValue)
      }
      //   else setHistory([])
    })
    return () => unsubscribe()
  }, [])

  const clearHistory = useCallback(() => {
    store.set(STORAGE_KEY, [])
  }, [])

  const handleClickItem = useCallback((item: HistoryItem) => {
    if (isHistoryImage(item)) {
      // if (item.value.url !== history[0].value) {
      clipboard.write({
        image: nativeImage.createFromDataURL(item.value.url),
      })
      // }
      return
    }
    // if (item.value !== history[0].value) {
    clipboard.write({
      text: item.value,
    })
    // }
  }, [])

  const handleDeleteItem = useCallback(
    (
      item: HistoryItem,
      {
        removeAllInstances,
      }: {
        /**
         * TODO add this
         * If `true`, it will delete any items with the given value.
         * If `false` (default), it will **only** delete the item you clicked, and not any others with the same value.
         * - It will use the date to determine this.
         */
        removeAllInstances?: boolean
      } = {}
    ) => {
      const currentState: HistoryItem[] = store.get(STORAGE_KEY) ?? []
      store.set(
        STORAGE_KEY,
        currentState.filter(i => {
          // if we just removed an image, and this one is an image
          if (isHistoryImage(i) && isHistoryImage(item)) {
            // remove the item if it has the same url and timestamp
            const isItemToRemove =
              i.value.url === item.value.url &&
              // if remove all instances is false, then we only remove this exact item
              // ...which we itentify by the timestamp
              (removeAllInstances || i.copiedAt === item.copiedAt)
            return !isItemToRemove
          }
          const isItemToRemove =
            i.value === item.value &&
            // if remove all instances is false, then we only remove this exact item
            // ...which we itentify by the timestamp
            (removeAllInstances || i.copiedAt === item.copiedAt)
          return !isItemToRemove
        })
      )
    },
    []
  )

  return {
    history: history,
    clearHistory,
    handleClickItem,
    handleDeleteItem,
    flatlist,
  }
}
