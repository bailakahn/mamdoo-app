import React from "react";
import { SafeAreaView } from "react-native";
import { PricingCard } from "react-native-elements";
import { useTheme } from "react-native-paper";
import { useStore } from "_store";
import { Classes } from "_styles";
import { t } from "_utils/lang";
import { useApp } from "_hooks";
const Main = () => {
    const { colors } = useTheme();
    const app = useApp();

    return (
        <SafeAreaView style={Classes.container(colors)}>
            <PricingCard
                color={colors.primary}
                title={t("main.iAmAClient")}
                info={[t("main.bookABike")]}
                button={{ title: t("main.start") }}
                onButtonPress={() => app.actions.setApp("client")}
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
                onButtonPress={() => app.actions.setApp("partner")}
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
