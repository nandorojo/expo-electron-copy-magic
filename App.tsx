// dependencies
import React from 'react'
import { View, FlatList } from 'react-native'
import { SearchBar, Divider, CheckBox } from 'react-native-elements'

import { NotifierWrapper } from 'react-native-notifier'

// my code
import { useClipboard } from './use-clipboard'
import { useSearch } from './use-search'
import { CopiedItem } from './Item'

export default function App() {
  const {
    history,
    handleClickItem,
    handleDeleteItem,
    flatlist,
  } = useClipboard()
  const {
    query,
    setQuery,
    showImages,
    showText,
    toggleShowImages,
    toggleShowText,
    filteredHistory,
  } = useSearch({ history })

  return (
    <NotifierWrapper>
      <View style={{ flex: 1, overflow: 'hidden', maxHeight: 500 }}>
        <SearchBar value={query} onChangeText={setQuery} />
        <View style={{ flexDirection: 'row' }}>
          <CheckBox
            checked={showText}
            title="Show Text"
            onPress={toggleShowText}
            containerStyle={{
              backgroundColor: 'transparent',
              borderWidth: 0,
              padding: 0,
            }}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
          />
          <CheckBox
            checked={showImages}
            title="Show Images"
            onPress={toggleShowImages}
            containerStyle={{
              backgroundColor: 'transparent',
              borderWidth: 0,
              padding: 0,
            }}
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
          />
        </View>
        <Divider />
        <FlatList
          data={filteredHistory}
          ref={flatlist}
          style={{ flex: 1, maxHeight: '100%', overflowY: 'scroll' }}
          contentContainerStyle={{
            flex: 1,
          }}
          keyExtractor={({ value, copiedAt }) => `${value}${copiedAt}`}
          renderItem={({ item }) => (
            <CopiedItem
              onDelete={handleDeleteItem}
              onPress={handleClickItem}
              {...item}
            />
          )}
          initialNumToRender={8}
          removeClippedSubviews
          ItemSeparatorComponent={Divider}
        />
      </View>
    </NotifierWrapper>
  )
}
