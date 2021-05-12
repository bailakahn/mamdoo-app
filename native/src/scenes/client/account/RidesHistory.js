import React, { useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useTheme, Text, DataTable } from "react-native-paper";
import { Classes } from "_styles";
import { useUser } from "_hooks";
import date from "../../../utils/helpers/date";
import { t, lang } from "_utils/lang"; // without this line it didn't work

export default function RidesHistoryScene() {
    const { colors } = useTheme();
    const user = useUser();

    useEffect(() => {
        user.actions.getRidesHistory();
    }, []);

    return (
        <ScrollView>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title style={Classes.dataCell(colors)}>
                        {t("ridesHistory.date")}
                    </DataTable.Title>
                    <DataTable.Title style={Classes.dataCell(colors)}>
                        {t("ridesHistory.mamdoo")}
                    </DataTable.Title>
                    <DataTable.Title style={Classes.dataCell(colors)}>
                        {t("ridesHistory.status")}
                    </DataTable.Title>
                </DataTable.Header>
                {user.ridesHistory.map((ride, i) => (
                    <DataTable.Row key={i}>
                        <DataTable.Cell style={Classes.dataCell(colors)}>
                            {date(ride.createdAt).format(
                                lang === "fr"
                                    ? "D MMM YYYY, HH:mm"
                                    : "YYYY MMM Do, HH:mm"
                            )}
                        </DataTable.Cell>
                        <DataTable.Cell style={Classes.dataCell(colors)}>
                            {ride.driver
                                ? `${ride.driver.firstName} ${ride.driver.lastName}`
                                : "Inconu"}
                        </DataTable.Cell>
                        <DataTable.Cell style={Classes.dataCell(colors)}>
                            <Text
                                style={{
                                    color:
                                        ride.status == "canceled"
                                            ? colors.accent
                                            : colors.primary
                                }}
                            >
                                {t(`profile.${ride.status}`)}
                            </Text>
                        </DataTable.Cell>
                    </DataTable.Row>
                ))}

                {/* <DataTable.Pagination
                    page={1}
                    numberOfPages={10}
                    onPageChange={(page) => {
                        console.log(page);
                    }}
                    label="1-2 of 6"
                /> */}
            </DataTable>
        </ScrollView>
    );
}
