import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "react-native-vector-icons/Ionicons";
import RNRestart from "react-native-restart";
import { Button, withTheme } from "react-native-paper";
import { Classes, Mixins } from "_styles";
import { t } from "_utils/lang";

export class ErrorBoundary extends React.Component {
    state = {
        error: false
    };

    static getDerivedStateFromError(error) {
        return { error: true };
    }

    componentDidCatch(error, errorInfo) {
        // deal with errorInfo if needed
    }

    destroyAuthToken = async () => {
        //   destroy auth and all compromised data
        // await AsyncStorage.removeItem('user_settings');
    };

    handleBackToSignIn = async () => {
        // remove user settings
        await this.destroyAuthToken();
        // restart app
        RNRestart.Restart();
    };

    render() {
        if (this.state.error) {
            return (
                <SafeAreaView style={Classes.container}>
                    <View style={{ padding: Mixins.scaleSize(20) }}>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 20
                            }}
                        >
                            <Text>
                                <FontAwesome
                                    name="ios-information-circle-outline"
                                    size={60}
                                    color={this.props.theme.colors.accent}
                                />
                            </Text>
                            <Text
                                style={{
                                    width: Mixins.width(300),
                                    fontSize: 25,
                                    fontWeight: "bold",
                                    color: this.props.theme.colors.accent
                                }}
                            >
                                {t("errors.crashErrorTitle")}
                            </Text>
                        </View>
                        <View>
                            <Text
                                style={{
                                    marginVertical: 10,
                                    lineHeight: 23,
                                    fontWeight: "500",
                                    fontSize: 20
                                }}
                            >
                                {t("errors.crashErrorBody")}
                            </Text>
                        </View>

                        <View style={{ marginTop: 20 }}>
                            <Button
                                style={{
                                    height: Mixins.height(50),
                                    justifyContent: "center"
                                }}
                                color={this.props.theme.colors.primary}
                                mode="contained"
                                onPress={() => this.handleBackToSignIn()}
                            >
                                {t("errors.crashTryAgain")}
                            </Button>
                        </View>
                    </View>
                </SafeAreaView>
            );
        } else {
            return this.props.children;
        }
    }
}

export default withTheme(ErrorBoundary);
