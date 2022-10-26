import React, { useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useTheme, Text, DataTable } from "react-native-paper";
import { Classes } from "_styles";
import { usePartner } from "_hooks";
import date from "../../../utils/helpers/date";
import { t2, lang } from "_utils/lang"; // without this line it didn't work

export default function RidesHistoryScene() {
    const { colors } = useTheme();
    const partner = usePartner();

    useEffect(() => {
        partner.actions.getRidesHistory();
    }, []);

    const getRideStatusColor = (status) => {
        let color = "primary";
        switch (status) {
            case "canceled":
                color = "error";
                break;
            case "ongoing":
                color = "warning";
                break;
            case "completed":
                color = "success";
                break;
            default:
                color = "primary";
                break;
        }

        return color;
    };

    return (
        <ScrollView>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title style={Classes.dataCell(colors)}>
                        Date
                    </DataTable.Title>
                    <DataTable.Title style={Classes.dataCell(colors)}>
                        Client
                    </DataTable.Title>
                    <DataTable.Title style={Classes.dataCell(colors)}>
                        Status
                    </DataTable.Title>
                </DataTable.Header>
                {partner.ridesHistory.map((ride, i) => (
                    <DataTable.Row key={i}>
                        <DataTable.Cell style={Classes.dataCell(colors)}>
                            {date(ride.createdAt).format(
                                lang === "fr"
                                    ? "D MMM YYYY, HH:mm"
                                    : "YYYY MMM Do, HH:mm"
                            )}
                        </DataTable.Cell>
                        <DataTable.Cell style={Classes.dataCell(colors)}>
                            {ride.client
                                ? `${ride.client.firstName} ${ride.client.lastName}`
                                : "Inconu"}
                        </DataTable.Cell>
                        <DataTable.Cell style={Classes.dataCell(colors)}>
                            <Text
                                style={{
                                    color: colors[
                                        getRideStatusColor(ride.status)
                                    ]
                                }}
                            >
                                {t2(`profile.${ride.status}`)}
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
