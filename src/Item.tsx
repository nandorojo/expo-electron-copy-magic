// dependencies
import React, { useRef } from 'react'
import { Image, Text, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import moment from 'moment'
import { useDimensions } from '@react-native-community/hooks'
import { Notifier, NotifierComponents } from 'react-native-notifier'
import { RectButton } from 'react-native-gesture-handler'
import { useHover, useFocus, useActive } from 'react-native-web-hooks'
import { useTimingTransition } from 'react-native-redash'
import Reanimated from 'react-native-reanimated'

// our code
import { HistoryItem, isHistoryImage } from './use-clipboard'
import { SwipeableItem } from './Swipeable'

type ItemProps = HistoryItem & {
  onPress: (value: HistoryItem) => void
  onDelete: (value: HistoryItem) => void
}

export const CopiedItem = React.memo(function CopiedItem({
  onPress,
  onDelete,
  ...props
}: ItemProps) {
  const { width: windowWidth } = useDimensions().window
  const ref = useRef(null)

  const isHovered = useHover(ref)
  const isFocused = useFocus(ref)
  const isActive = useActive(ref)
  const animatedHoverState = useTimingTransition(
    // this is 1 if this item is not hovered
    // it is 0 if it is hovered
    !isHovered && !isFocused && !isActive
  )

  // if the copied item was an image
  if (isHistoryImage(props)) {
    const { url, height, width } = props.value
    const aspectRatio = width / height

    // create dimensions that stretch the full width
    const padding = 28
    const paddedWidth = windowWidth - padding * 2
    const paddedHeight = paddedWidth / aspectRatio

    // if the original image is smaller than the full width, use that instead
    const finalWidth = width < paddedWidth ? width : paddedWidth
    const finalHeight = width < paddedWidth ? height : paddedHeight

    const press = () => {
      onPress(props) // this, from use-clipboard, will re-copy this item.
      Notifier.showNotification({
        title: 'Copied Image!',
        componentProps: {
          imageSource: {
            uri: url,
          },
        },
        Component: NotifierComponents.Notification,
      })
    }

    return (
      <SwipeableItem onDelete={() => onDelete(props)}>
        <Reanimated.View
          ref={ref}
          style={{
            // lower opacity when we hover
            opacity: Reanimated.interpolate(animatedHoverState, {
              inputRange: [0, 1],
              outputRange: [0.25, 1],
            }),
          }}
        >
          <RectButton onPress={press}>
            <ListItem
              title={
                <View
                  style={{
                    elevation: 10,
                    shadowColor: '#33333320',
                    shadowRadius: 10,
                    alignSelf: 'flex-start',
                    borderRadius: 10,
                  }}
                >
                  <Image
                    source={{ uri: url }}
                    style={{ width: finalWidth, height: finalHeight }}
                    resizeMode="contain"
                  />
                </View>
              }
              subtitle={`${props.type} copied ${moment(
                props.copiedAt
              ).calendar()}`}
              subtitleStyle={{ marginTop: 16 }}
            ></ListItem>
          </RectButton>
        </Reanimated.View>
      </SwipeableItem>
    )
  }

  const { type, value, copiedAt } = props

  const press = () => {
    onPress(props)
    Notifier.showNotification({
      title: 'Copied!',
      // @ts-ignore (we pass a text node here instead of a string, it's fine)
      description: <Text numberOfLines={3}>{value}</Text>,
      Component: NotifierComponents.Notification,
    })
  }

  return (
    <SwipeableItem onDelete={() => onDelete(props)}>
      <Reanimated.View
        style={{
          opacity: Reanimated.interpolate(animatedHoverState, {
            inputRange: [0, 1],
            outputRange: [0.25, 1],
          }),
        }}
        ref={ref}
      >
        <RectButton onPress={press}>
          <ListItem
            title={value}
            titleProps={{
              numberOfLines: 8,
            }}
            titleStyle={{ fontWeight: 'bold' }}
            subtitle={`${type} copied ${moment(copiedAt).calendar()}`}
          />
        </RectButton>
      </Reanimated.View>
    </SwipeableItem>
  )
})
