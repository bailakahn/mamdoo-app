import React, { useState } from "react";
import { Animated, PanResponder, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useTheme as useMamdooTheme } from "_hooks";

const BottomSheet = ({
  children,
  height = "20%",
  style = {},
  showTopBar = true,
  topBarStyle = {},
}) => {
  const { colors } = useTheme();
  const [position, setPosition] = useState(new Animated.Value(0));
  const theme = useMamdooTheme();

  const handlePanResponderMove = (evt, gestureState) => {
    const { dy } = gestureState;
    setPosition(dy);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: handlePanResponderMove,
    onPanResponderRelease: () => {},
  });

  return (
    <Animated.View
      style={{
        ...{
          height,
          backgroundColor: theme?.isDarkMode ? colors.background : "#fff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingVertical: 10,
          elevation: 10, // Add elevation to create a shadow effect
          shadowColor: "#000", // Set shadow color to black
          shadowOpacity: 0.2, // Set shadow opacity
          shadowRadius: 10, // Set shadow radius
          shadowOffset: { width: 0, height: -5 }, // Set shadow offset
        },
        ...style,
        ...{
          transform: [{ translateY: position }],
        },
      }}
      //   {...panResponder.panHandlers}
    >
      {showTopBar && (
        <View
          style={{
            ...{
              alignSelf: "center",
              width: 50,
              height: 5,
              borderRadius: 5,
              backgroundColor: theme?.isDarkMode
                ? colors.inputBoder
                : "#e0e0e0",
              marginTop: -5,
              marginBottom: 5,
            },
            ...topBarStyle,
          }}
        />
      )}
      {children}
    </Animated.View>
  );
};

export default BottomSheet;
