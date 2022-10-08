import React, { useEffect, useMemo, useState, useLayoutEffect } from "react";
import { View, ScrollView, Platform } from "react-native";
import {
    useTheme,
    List,
    Divider,
    TextInput,
    Caption,
    Text,
    Dialog,
    Portal,
    Paragraph
} from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { useUser } from "_hooks";
import { Button } from "_atoms";

export default function ProfileScene({ navigation }) {
    const { colors } = useTheme();
    const user = useUser();
    const [isEdit, setIsEdit] = useState(false);

    const [editUser, setEditUser] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(
        () =>
            setEditUser({
                firstName: user.user.firstName,
                lastName: user.user.lastName,
                phoneNumber: user.user.phoneNumber
            }),
        [user.user]
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
    const DeleteConfirmation = () => (
        <Portal>
            <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                <Dialog.Title>{t2("profile.deleteConfirm")}</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>{t2("profile.deleteWarning")}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button
                        onPress={() => setVisible(false)}
                        style={{ marginRight: 50 }}
                    >
                        <Text style={{ color: colors.text }}>
                            {t2("profile.cancel")}
                        </Text>
                    </Button>
                    <Button
                        mode="text"
                        onPress={() => {
                            setVisible(false);
                            user.actions.deleteAccount();
                        }}
                    >
                        <Text style={{ color: colors.error }}>
                            {t2("profile.delete")}
                        </Text>
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
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
            <DeleteConfirmation />
            {!isEdit ? (
                <View>
                    <View style={{ marginTop: 10 }}>
                        <Caption
                            style={{
                                fontWeight: "bold",
                                fontSize: 20,
                                marginLeft: 10,
                                ...(Platform.OS === "android" && {
                                    marginBottom: 20
                                })
                            }}
                        >
                            {t2("form.personalInfo")}
                        </Caption>

                        {fields.map(({ name, title }, i) => (
                            <View key={i}>
                                <List.Item
                                    title={title}
                                    description={user.user[name]}
                                    style={Classes.menuItem(colors)}
                                    titleStyle={{ color: colors.disabled }}
                                    descriptionStyle={{
                                        color: colors.text,
                                        fontSize: 20,
                                        fontWeight: "bold",
                                        marginTop: 10,
                                        ...(Platform.OS === "android" && {
                                            marginBottom: 20
                                        })
                                    }}
                                />
                                <Divider />
                            </View>
                        ))}
                        <View style={Classes.containerCenter(colors)}>
                            <Button
                                mode="contained"
                                onPress={() => setVisible(true)}
                                style={Classes.deleteAccountButton(colors)}
                                contentStyle={{
                                    height: 50
                                }}
                            >
                                <Text style={{ color: colors.white }}>
                                    {t2("profile.deleteAccount")}
                                </Text>
                            </Button>
                        </View>
                        <Divider />
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
                                user.actions.saveChanges(
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
