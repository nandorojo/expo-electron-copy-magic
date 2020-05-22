import React, { useRef } from 'react'
import Swipes, {
  SwipeableProperties,
} from 'react-native-gesture-handler/Swipeable'
import { Animated, Text, View, StyleSheet, TextStyle } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'

type SwipeableProps = {
  rightActions?: null | SwipeableAction[]
  leftActions?: null | SwipeableAction[]
  children: React.ReactNode
  //   id: string
  actionWidth?: number
  gestureHandlerProps?: SwipeableProperties
  textStyle?: TextStyle
  renderLeftActions?:
    | null
    | ((
        actions: SwipeableAction[],
        progress: Animated.Value | Animated.AnimatedInterpolation,
        drag: Animated.AnimatedInterpolation
      ) => React.ReactNode)
  renderRightActions?:
    | null
    | ((
        action: SwipeableAction[],
        progress: Animated.Value | Animated.AnimatedInterpolation,
        drag: Animated.AnimatedInterpolation
      ) => React.ReactNode)
  renderAction?:
    | null
    | ((
        action: SwipeableAction,
        index: number,
        progress: Animated.Value | Animated.AnimatedInterpolation,
        drag: Animated.AnimatedInterpolation,
        side: 'left' | 'right'
      ) => React.ReactNode)
}

type SwipeableAction = {
  text: string
  renderIcon?: (
    progress?: Animated.Value | Animated.AnimatedInterpolation,
    drag?: Animated.AnimatedInterpolation
  ) => React.ReactNode
  color: string
  backgroundColor: string
  onPress?: () => void
}

const Swipeable = (props: SwipeableProps) => {
  const { actionWidth, gestureHandlerProps = {} } = props
  const actionItemWidth = actionWidth || 64
  const swipeableRowRef = useRef<Swipes>(null)

  function renderAction(
    action: SwipeableAction,
    index: number,
    progress: Progress,
    drag: Drag,
    side: 'left' | 'right',
    numberOfActions: number
  ) {
    if (props.renderAction)
      return props.renderAction(action, index, progress, drag, side)
    if (props.renderAction === null) return null

    const outputRange =
      side === 'right'
        ? [(numberOfActions - index) * actionItemWidth, 0]
        : [-index * actionItemWidth, 0]

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange,
    })

    function onPress() {
      if (swipeableRowRef.current) swipeableRowRef.current.close()
      if (action.onPress) action.onPress()
    }

    return (
      <Animated.View
        key={JSON.stringify(action)}
        style={{ flex: 1, transform: [{ translateX }] }}
      >
        <RectButton
          style={[styles.action, { backgroundColor: action.backgroundColor }]}
          onPress={onPress}
        >
          {action.renderIcon && action.renderIcon(progress, drag)}
          <Text
            style={[
              styles.actionText,
              { color: action.color },
              props.textStyle,
            ]}
          >
            {action.text}
          </Text>
        </RectButton>
      </Animated.View>
    )
  }
  function renderRightActions(progress: Progress, drag: Drag) {
    const actions =
      props.rightActions ||
      [
        // {
        // 	color: 'white',
        // 	backgroundColor: 'purple',
        // 	IconNode: null,
        // 	text: 'Test'
        // }
      ]
    if (props.renderRightActions)
      return props.renderRightActions(actions, progress, drag)
    if (props.renderRightActions === null) return null

    return renderActionList(actions, progress, drag, 'right')
  }
  function renderLeftActions(progress: Progress, drag: Drag) {
    const actions =
      props.leftActions ||
      [
        // {
        // 	color: 'white',
        // 	backgroundColor: 'blue',
        // 	IconNode: null,
        // 	text: 'Scripture monkey'
        // }
      ]
    if (props.renderLeftActions)
      return props.renderLeftActions(actions, progress, drag)
    if (props.renderLeftActions === null) return null

    return renderActionList(actions, progress, drag, 'left')
  }
  function renderActionList(
    actions: SwipeableAction[],
    progress: Progress,
    drag: Drag,
    side: 'left' | 'right'
  ) {
    return (
      <View
        style={[styles.actionList, { width: actionItemWidth * actions.length }]}
      >
        {actions.map((action, index) =>
          renderAction(action, index, progress, drag, side, actions.length)
        )}
      </View>
    )
  }
  return (
    <Swipes
      friction={2}
      leftThreshold={30}
      rightThreshold={40}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      ref={swipeableRowRef}
      {...gestureHandlerProps}
    >
      {props.children}
    </Swipes>
  )
}

export default React.memo(Swipeable)

type Progress = Animated.Value | Animated.AnimatedInterpolation
type Drag = Animated.AnimatedInterpolation

const styles = StyleSheet.create({
  actionList: {
    flexDirection: 'row',
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionText: {
    padding: 10,
  },
})
