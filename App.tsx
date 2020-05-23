import * as React from 'react'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { NotifierWrapper } from 'react-native-notifier'
import App from './src'

export default function Providers() {
  return (
    <ActionSheetProvider>
      <NotifierWrapper>
        <App />
      </NotifierWrapper>
    </ActionSheetProvider>
  )
}
