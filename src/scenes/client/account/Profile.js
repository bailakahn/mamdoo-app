import React, { useEffect, useMemo, useState, useLayoutEffect } from "react";
import { View, ScrollView, Platform } from "react-native";
import {
  useTheme,
  List,
  Divider,
  TextInput,
  Caption,
  Text,
} from "react-native-paper";
import { Classes } from "_styles";
import { t2 } from "_utils/lang";
import { useUser } from "_hooks";
import { Button, LoadingV2 } from "_atoms";
import PopConfirm from "_organisms/PopConfirm";

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
        phoneNumber: user.user.phoneNumber,
      }),
    [user.user]
  );

  const fields = useMemo(
    () => [
      {
        name: "firstName",
        title: t2("form.firstName"),
      },
      {
        name: "lastName",
        title: t2("form.lastName"),
      },
      {
        name: "phoneNumber",
        title: t2("form.phoneNumber"),
      },
    ],
    []
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        !isEdit ? (
          <Button onPress={() => setIsEdit(!isEdit)}>
            <Text style={{ color: colors.primary, fontSize: 20 }}>
              {t2("profile.edit")}
            </Text>
          </Button>
        ) : (
          <Button onPress={() => setIsEdit(!isEdit)}>
            <Text style={{ color: colors.accent, fontSize: 20 }}>
              {t2("profile.cancel")}
            </Text>
          </Button>
        ),
    });
  }, [navigation, isEdit]);

  return user.isLoading ? (
    <LoadingV2 />
  ) : (
    <ScrollView style={Classes.container2(colors)}>
      <PopConfirm
        title={t2("profile.deleteConfirm")}
        visible={visible}
        setVisible={setVisible}
        content={t2("profile.deleteWarning")}
        onCancel={() => setVisible(false)}
        cancelText={t2("profile.cancel")}
        onConfirm={() => {
          setVisible(false);
          user.actions.deleteAccount();
        }}
        okText={t2("profile.delete")}
      />

      {!isEdit ? (
        <View>
          <View style={{ marginTop: 10 }}>
            <Caption
              style={{
                fontWeight: "bold",
                fontSize: 20,
                marginLeft: 10,
                ...(Platform.OS === "android" && {
                  marginBottom: 20,
                }),
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
                  }}
                />
                <Divider />
              </View>
            ))}
            <View style={Classes.containerCenter(colors)}>
              <Button
                mode="contained"
                onPress={() => setVisible(true)}
                {...Classes.buttonContainer(colors)}
                buttonColor={colors.error}
              >
                <Text style={{ color: colors.white }}>
                  {t2("profile.deleteAccount")}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <View>
            {fields.map(({ name, title }, i) => (
              <TextInput
                key={i}
                style={Classes.formInput(colors)}
                outlineStyle={{ borderRadius: 10 }}
                contentStyle={Classes.formInputContent(colors)}
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
                  disabled: true,
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
                  color: colors.primary,
                }}
              >
                {t2("profile.sucessfullySaved")}
              </Text>
            </View>
          )}

          <View>
            <Button
              onPress={() =>
                user.actions.saveChanges(editUser, setShowSuccess, setIsEdit)
              }
              mode="contained"
              {...Classes.buttonContainer(colors)}
            >
              {t2("profile.saveChanges")}
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
