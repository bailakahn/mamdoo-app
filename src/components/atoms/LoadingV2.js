import React from "react";
import { View } from "react-native";
import { Classes } from "_styles";
import { useTheme, ActivityIndicator } from "react-native-paper";
function Loading({
  color,
  animating = true,
  size = "large",
  hidesWhenStopped = true,
  style,
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        ...Classes.container(colors),
      }}
    >
      <ActivityIndicator
        animating={animating}
        color={color || colors.primary}
        size={size}
        hidesWhenStopped={hidesWhenStopped}
        style={style}
      />
    </View>
  );
}

export default React.memo(Loading);
