import React from "react";
import { Button as PaperButton } from "react-native-paper";

export default function Button({ labelStyle, disabled, style, ...props }) {
  return (
    <PaperButton
      {...props}
      disabled={disabled}
      style={{
        ...style,
        ...(disabled ? { backgroundColor: "lightgray" } : {}),
      }}
      labelStyle={{ color: "#ffffff", ...labelStyle }}
    />
  );
}
