import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { t2 } from "_utils/lang";
import { Button, LoadingV2 } from "_atoms";
import { usePartner } from "_hooks";

const DOC_ITEMS = [
  { icon: "person", key: "aProfilePicture" },
  { icon: "badge", key: "driverLicence" },
  { icon: "directions-car", key: "licenceRegistration" },
];

export default function NotActive({ navigation }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const insets = useSafeAreaInsets();

  if (partner.isLoading) return <LoadingV2 />;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconWrap}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
            <Icon name="upload-file" size={40} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{t2("upload.notActive")}</Text>
        <Text style={styles.subtitle}>{t2("upload.notActiveText")}</Text>

        <Text style={[styles.listHeader, { color: colors.text }]}>{t2("upload.listOfIds")}</Text>

        {DOC_ITEMS.map(({ icon, key }) => (
          <View key={key} style={[styles.docRow, { borderColor: "#E5E7EB", backgroundColor: colors.primary + "08" }]}>
            <View style={[styles.docIcon, { backgroundColor: colors.primary + "18" }]}>
              <Icon name={icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.docLabel, { color: colors.text }]}>{t2(`upload.${key}`)}</Text>
          </View>
        ))}

        <Text style={[styles.timeNote, { color: "#9CA3AF" }]}>{t2("upload.timeToValidate")}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("UploadInstructions")}
          style={styles.btn}
          contentStyle={styles.btnContent}
        >
          {t2("upload.addDocuments")}
        </Button>

        <Button
          mode="outlined"
          onPress={() => partner.actions.logout()}
          style={[styles.logoutBtn, { borderColor: colors.error + "60" }]}
          contentStyle={styles.btnContent}
          textColor={colors.error}
        >
          {t2("upload.logout")}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },

  iconWrap: { alignItems: "center", marginBottom: 24 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#9CA3AF", lineHeight: 22, marginBottom: 28 },

  listHeader: { fontSize: 15, fontWeight: "600", marginBottom: 16 },

  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  docLabel: { fontSize: 15, fontWeight: "500", flex: 1 },

  timeNote: { fontSize: 13, lineHeight: 20, marginTop: 8 },

  footer: { paddingHorizontal: 24, paddingTop: 12, gap: 20 },
  btn: { borderRadius: 14 },
  btnContent: { height: 56 },
  logoutBtn: { borderRadius: 14 },
});
