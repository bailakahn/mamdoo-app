import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { usePartner, useTheme as useMamdooTheme } from "_hooks";
import { useRide } from "_hooks/partner";
import date from "../../../utils/helpers/date";
import { t2, lang } from "_utils/lang";
import { LoadingV2 } from "_atoms";

const CAB_IMAGES = {
  bike: require("_assets/bike2.png"),
  car: require("_assets/car2.png"),
  tuk: require("_assets/tuk.png"),
};

export default function RidesHistoryScene({ navigation }) {
  const { colors } = useTheme();
  const mamdooTheme = useMamdooTheme();
  const insets = useSafeAreaInsets();
  const partner = usePartner();
  const rideHook = useRide();
  const [filter, setFilter] = useState("completed");

  const borderColor = mamdooTheme.isDarkMode ? colors.border : "#E5E7EB";

  useEffect(() => {
    partner.actions.getRidesHistory();
  }, []);

  const formatPrice = (ride) => {
    const price = ride?.finalPrice ?? ride?.maxPrice;
    return price ? `${rideHook.actions.formatPrice(price)} GNF` : "—";
  };

  const getCanceledByLabel = (ride) => {
    if (!ride.cancelation) return null;
    return ride.cancelation.driverId
      ? t2("ridesHistory.canceledByYou")
      : t2("ridesHistory.canceledByClient");
  };

  const filteredRides = (partner.ridesHistory ?? []).filter((r) => r.status === filter);

  const renderItem = ({ item: ride, index }) => {
    const cabName = ride.cabType?.name ?? "bike";
    const cabImage = CAB_IMAGES[cabName] ?? CAB_IMAGES.bike;
    const clientName = ride.client
      ? `${ride.client.firstName} ${ride.client.lastName}`
      : "—";
    const destination = ride.dropOff?.text ?? clientName;
    const origin = ride.pickUp?.text ?? null;
    const rideDate = date(ride.createdAt).format(
      lang === "fr" ? "DD MMM · HH:mm" : "MMM DD · HH:mm"
    );
    const canceledBy = filter === "canceled" ? getCanceledByLabel(ride) : null;
    const isLast = index === filteredRides.length - 1;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("RideDetail", { ride })}
        activeOpacity={0.7}
        style={styles.row}
      >
        <View style={styles.vehicleBox}>
          <Image source={cabImage} style={styles.vehicleImage} resizeMode="contain" />
        </View>

        <View style={styles.rowContent}>
          <Text style={[styles.destination, { color: colors.text }]} numberOfLines={1}>
            {destination}
          </Text>
          {origin && (
            <Text style={styles.origin} numberOfLines={1}>{origin}</Text>
          )}
          <Text style={styles.rowDate}>{rideDate} · {clientName}</Text>
          {canceledBy && (
            <Text style={[styles.canceledBy, { color: colors.error }]}>{canceledBy}</Text>
          )}
        </View>

        <View style={styles.rowRight}>
          <Text style={[styles.price, { color: colors.text }]}>{formatPrice(ride)}</Text>
          <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </View>

        {!isLast && <View style={[styles.divider, { backgroundColor: borderColor }]} />}
      </TouchableOpacity>
    );
  };

  const emptyKey = filter === "completed" ? "ridesHistory.noCompletedRides" : "ridesHistory.noCanceledRides";

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t2("account.ridesHistory")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterRow, { borderBottomColor: borderColor }]}>
        {["completed", "canceled"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={[
              styles.filterTab,
              filter === tab && [styles.filterTabActive, { borderBottomColor: colors.primary }],
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: filter === tab ? colors.primary : "#9CA3AF" },
              ]}
            >
              {t2(`ridesHistory.${tab}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {partner.isLoading ? (
        <LoadingV2 />
      ) : (
        <FlatList
          data={filteredRides}
          keyExtractor={(ride) => ride._id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom + 16, 24) },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="directions-car" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>{t2(emptyKey)}</Text>
            </View>
          }
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            if (partner.ridesHistory.length === 0) return;
            partner.actions.getMoreRidesHistory(
              partner.ridesHistory[partner.ridesHistory.length - 1].createdAt
            );
          }}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700" },

  filterRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  filterTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabActive: { borderBottomWidth: 2 },
  filterTabText: { fontSize: 14, fontWeight: "600" },

  list: { paddingTop: 8 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  vehicleBox: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  vehicleImage: { width: 44, height: 44 },
  rowContent: { flex: 1, marginRight: 8 },
  destination: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  origin: { fontSize: 12, color: "#9CA3AF", marginBottom: 3 },
  rowDate: { fontSize: 12, color: "#9CA3AF" },
  canceledBy: { fontSize: 12, fontWeight: "500", marginTop: 3 },
  rowRight: { flexDirection: "row", alignItems: "center", flexShrink: 0, gap: 4 },
  price: { fontSize: 14, fontWeight: "700" },
  divider: { position: "absolute", bottom: 0, left: 82, right: 0, height: 1 },

  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9CA3AF", marginTop: 12, fontSize: 14 },
});
