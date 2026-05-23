import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { useTheme as useMamdooTheme } from "_hooks";

export default function OtpInput({ value = "", onChange, error = false }) {
  const { colors } = useTheme();
  const { isDarkMode } = useMamdooTheme();

  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const refs = [ref0, ref1, ref2, ref3];

  const handleChange = (text, index) => {
    const digits = text.replace(/\D/g, "");

    if (digits.length > 1) {
      // Paste: fill all boxes starting from this index
      const newValue = (value.slice(0, index) + digits).slice(0, 4);
      onChange(newValue);
      const next = Math.min(newValue.length, 3);
      refs[next].current?.focus();
      return;
    }

    if (!digits) return;
    const newValue = (value.slice(0, index) + digits).slice(0, 4);
    onChange(newValue);
    if (newValue.length < 4) refs[newValue.length].current?.focus();
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key !== "Backspace") return;
    if (value[index]) {
      onChange(value.slice(0, index));
    } else if (index > 0) {
      onChange(value.slice(0, index - 1));
      refs[index - 1].current?.focus();
    }
  };

  const handleFocus = (index) => {
    const next = Math.min(value.length, 3);
    if (index > next) refs[next].current?.focus();
  };

  const defaultBorder = isDarkMode ? "#3B3B3B" : "#E5E7EB";
  const filledBorder = error ? colors.error : colors.primary;

  return (
    <View style={styles.row}>
      {[0, 1, 2, 3].map((i) => (
        <TextInput
          key={i}
          ref={refs[i]}
          style={[
            styles.box,
            {
              backgroundColor: isDarkMode ? "#232323" : "#F9FAFB",
              borderColor: value[i] ? filledBorder : (error ? colors.error : defaultBorder),
              color: colors.text,
            },
          ]}
          value={value[i] || ""}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          onFocus={() => handleFocus(i)}
          keyboardType="number-pad"
          maxLength={4}
          selectTextOnFocus
          textAlign="center"
          caretHidden
          // iOS: suggest OTP from SMS
          textContentType="oneTimeCode"
          // Android: suggest OTP from SMS
          autoComplete="one-time-code"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  box: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    fontSize: 26,
    fontWeight: "700",
  },
});
