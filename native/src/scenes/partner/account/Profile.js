import React, { useEffect, useMemo, useState, useLayoutEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import {
    Button,
    useTheme,
    List,
    Divider,
    TextInput,
    Caption,
    HelperText
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { useApp, usePartner } from "_hooks";

export default function ProfileScene({ navigation }) {
    const { colors } = useTheme();
    const partner = usePartner();
    const app = useApp();
    const [isEdit, setIsEdit] = useState(false);

    const [editUser, setEditUser] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(
        () =>
            setEditUser({
                firstName: partner.partner.firstName,
                lastName: partner.partner.lastName,
                phoneNumber: partner.partner.phoneNumber,
                cab: {
                    model: partner.partner.cab.model,
                    licensePlate: partner.partner.cab.licensePlate
                }
            }),
        [partner.partner]
    );

    const fields = useMemo(
        () => [
            {
                name: "firstName",
                title: t2("form.firstName")
            },
            {
                name: "lastName",
                title: t2("form.lastName")
            },
            {
                name: "phoneNumber",
                title: t2("form.phoneNumber")
            }
        ],
        []
    );

    const cab = useMemo(
        () => [
            {
                name: "model",
                title: t2("form.cabModel")
            },
            {
                name: "licensePlate",
                title: t2("form.licensePlate")
            }
        ],
        []
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                !isEdit ? (
                    <Button onPress={() => setIsEdit(!isEdit)}>
                        <Text style={{ color: colors.primary }}>
                            {t2("profile.edit")}
                        </Text>
                    </Button>
                ) : (
                    <Button onPress={() => setIsEdit(!isEdit)}>
                        <Text style={{ color: colors.accent }}>
                            {t2("profile.cancel")}
                        </Text>
                    </Button>
                )
        });
    }, [navigation, isEdit]);

    return (
        <ScrollView style={Classes.container2(colors)}>
            {!isEdit ? (
                <View>
                    <View style={{ marginTop: 10 }}>
                        <Caption
                            style={{
                                fontWeight: "bold",
                                fontSize: 20,
                                marginLeft: 10
                            }}
                        >
                            {t2("form.personalInfo")}
                        </Caption>

                        {fields.map(({ name, title }, i) => (
                            <View key={i}>
                                <List.Item
                                    title={title}
                                    description={partner.partner[name]}
                                    style={Classes.menuItem(colors)}
                                    titleStyle={{ color: colors.disabled }}
                                    descriptionStyle={{
                                        color: colors.text,
                                        fontSize: 20,
                                        fontWeight: "bold",
                                        marginTop: 10
                                    }}
                                />
                                <Divider />
                            </View>
                        ))}
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Caption
                            style={{
                                fontWeight: "bold",
                                fontSize: 20,
                                marginLeft: 10
                            }}
                        >
                            {t2("form.cabInfo")}
                        </Caption>
                        {cab.map(({ name, title }, i) => (
                            <View key={i}>
                                <List.Item
                                    title={title}
                                    description={partner.partner.cab[name]}
                                    style={Classes.menuItem(colors)}
                                    titleStyle={{ color: colors.disabled }}
                                    descriptionStyle={{
                                        color: colors.text,
                                        fontSize: 20,
                                        fontWeight: "bold",
                                        marginTop: 10
                                    }}
                                />
                                <Divider />
                            </View>
                        ))}
                    </View>
                </View>
            ) : (
                <View style={{ alignItems: "center" }}>
                    <View>
                        {fields.map(({ name, title }, i) => (
                            <TextInput
                                key={i}
                                style={Classes.profileFormInput(colors)}
                                mode="outlined"
                                label={title}
                                value={editUser[name]}
                                onChangeText={(value) =>
                                    setEditUser({ ...editUser, [name]: value })
                                }
                                maxLength={name === "phoneNumber" ? 9 : 50}
                                {...(name === "phoneNumber" && {
                                    keyboardType: "number-pad",
                                    returnKeyType: "done",
                                    disabled: true
                                })}
                            />
                        ))}

                        {cab.map(({ name, title }, i) => (
                            <TextInput
                                key={i}
                                style={Classes.profileFormInput(colors)}
                                mode="outlined"
                                label={title}
                                value={editUser.cab[name]}
                                onChangeText={(value) =>
                                    setEditUser({
                                        ...editUser,
                                        cab: { ...editUser.cab, [name]: value }
                                    })
                                }
                                maxLength={name === "model" ? 20 : 6}
                                disabled
                            />
                        ))}
                    </View>

                    <View style={Classes.statusNoticeView(colors)}>
                        <Icon
                            name="info-outline"
                            color={colors.accent}
                            size={30}
                        />
                        <Text
                            style={[
                                Classes.text(colors),
                                { fontSize: 10, marginLeft: 10 }
                            ]}
                        >
                            {t2("profile.secureInfoInfo")}
                        </Text>
                    </View>

                    {showSuccess && (
                        <View>
                            <Text
                                style={{
                                    fontSize: 20,
                                    marginLeft: 10,
                                    color: colors.primary
                                }}
                            >
                                {t2("profile.sucessfullySaved")}
                            </Text>
                        </View>
                    )}

                    <View>
                        <Button
                            onPress={() =>
                                partner.actions.saveChanges(
                                    editUser,
                                    setShowSuccess
                                )
                            }
                            mode="contained"
                            style={Classes.profileFormButton(colors)}
                            contentStyle={Classes.profileFormButtonContent(
                                colors
                            )}
                        >
                            {t2("profile.saveChanges")}
                        </Button>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}
