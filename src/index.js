import React from "react";
import { SafeAreaView } from "react-native";
import { PricingCard } from "react-native-elements";
import { useTheme } from "react-native-paper";
import { useStore } from "_store";
import { Classes } from "_styles";
import { t } from "_utils/lang";

const Main = () => {
    const { colors } = useTheme();

    const {
        main: { app },
        actions: { setApp }
    } = useStore();

    return (
        <SafeAreaView style={Classes.container(colors)}>
            <PricingCard
                color={colors.primary}
                title={t("main.iAmAClient")}
                info={[t("main.bookABike")]}
                button={{ title: t("main.start") }}
                onButtonPress={() => setApp("client")}
                containerStyle={{
                    backgroundColor: colors.background,
                    borderColor: colors.border
                }}
                infoStyle={{
                    color: colors.text
                }}
            />
            <PricingCard
                color={colors.accent}
                title={t("main.iAmAPartner")}
                info={[t("main.iWantMoreClients")]}
                button={{ title: t("main.start") }}
                onButtonPress={() => setApp("driver")}
                containerStyle={{
                    backgroundColor: colors.background,
                    borderColor: colors.border
                }}
                infoStyle={{
                    color: colors.text
                }}
            />
        </SafeAreaView>
    );
};

export default Main;
