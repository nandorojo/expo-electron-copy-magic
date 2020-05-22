import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useClipboard } from './use-clipboard'
import { useSearch } from './use-search'

export default function App() {
  const { query } = useSearch()
  const { history, clearHistory } = useClipboard({ query })

  return (
    <View style={styles.container}>
      <Text>Hi there</Text>
      {/* <Text onPress={clearHistory}>from board: {JSON.stringify(history)}</Text> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
