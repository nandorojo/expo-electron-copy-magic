// dependencies
import React from 'react'
import { View, FlatList, Alert, Text } from 'react-native'
import { SearchBar, Divider, CheckBox } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons'
import {
  ActionSheetProvider,
  useActionSheet,
} from '@expo/react-native-action-sheet'

import { NotifierWrapper } from 'react-native-notifier'

// my code
import { useClipboard } from './use-clipboard'
import { useSearch } from './use-search'
import { CopiedItem } from './Item'

function App() {
  const {
    history,
    handleClickItem,
    handleDeleteItem,
    flatlist,
    clearHistory,
  } = useClipboard()
  const {
    query,
    setQuery,
    showImages,
    showText,
    toggleShowImages,
    toggleShowText,
    filteredHistory,
    isEmptyList,
  } = useSearch({ history })
  const { showActionSheetWithOptions } = useActionSheet()

  return (
    <View style={{ flex: 1, overflow: 'hidden', maxHeight: 500 }}>
      <SearchBar value={query} onChangeText={setQuery} />
      {!isEmptyList && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
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

          <Ionicons
            style={{ marginVertical: 10, paddingHorizontal: 16 }}
            name="ios-trash"
            size={30}
            color="black"
            onPress={() => {
              const options = ['Delete History Forever', 'Cancel']
              showActionSheetWithOptions(
                {
                  options,
                  cancelButtonIndex: 1,
                  destructiveButtonIndex: 0,
                  title: 'Delete copy history permanently?',
                  message:
                    'This cannot be undone. If you want to delete individual items, swipe them to the left.',
                  titleTextStyle: {
                    color: 'black',
                    fontWeight: 'bold',
                  },
                },
                index => {
                  if (index === 0) clearHistory()
                }
              )
            }}
          />
        </View>
      )}
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
        ListEmptyComponent={() =>
          isEmptyList ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                }}
              >
                ⚡️ Welcome! {'\n\n'}Try copying something on your computer, and
                watch it show up here.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

export default function Providers() {
  return (
    <ActionSheetProvider>
      <NotifierWrapper>
        <App />
      </NotifierWrapper>
    </ActionSheetProvider>
  )
}
