import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BACKEND_ENDPOINT } from "@env";
import Constants from "expo-constants";
import { useStore } from "_store";
const PROVIDER_URL = Constants.expoConfig.extra.providerUrl;

export function useApi() {
    const {
        main: { app },
        auth: { user = {}, partner = {} }
    } = useStore();

    const getRequest = ({ method = "GET", endpoint, params }) => {
        let url = PROVIDER_URL + endpoint;

        const options = {
            headers: {
                app,
                "x-mamdoo-access-token":
                    app === "client" ? user?.accessToken : partner?.accessToken
            },
            method
        };

        if (params)
            if (method === "POST") {
                options.headers["Content-Type"] = "application/json";
                options.body = JSON.stringify(params);
            } else {
                const queryString = Object.keys(params)
                    .map((key) => key + "=" + params[key])
                    .join("&");
                url += "?" + queryString;
            }

        // console.log("Making request", { url, options });
        return fetch(url, options)
            .then(async (res) => ({
                status: res.status,
                data: await res.json()
            }))
            .then(({ status, data }) => {
                if (status !== 200) {
                    console.log({ status, data });
                    const error = new Error(`${data.type}: ${data.message}`);
                    error.code = data.code;
                    error.status = status;
                    throw error;
                    return;
                }
                return data;
            })
            .catch((err) => {
                throw err;
            });
    };

    return getRequest;
}

export function api() {
    const getRequest = ({ method = "GET", endpoint, params }) => {
        AsyncStorage.getItem("@mamdoo-partner").then((user) => {
            const partner = JSON.parse(user);

            let url = PROVIDER_URL + endpoint;

            const options = {
                headers: {
                    "x-mamdoo-access-token": partner?.accessToken
                },
                method
            };

            if (params)
                if (method === "POST") {
                    options.headers["Content-Type"] = "application/json";
                    options.body = JSON.stringify(params);
                } else {
                    const queryString = Object.keys(params)
                        .map((key) => key + "=" + params[key])
                        .join("&");
                    url += "?" + queryString;
                }

            // console.log("Making request", { url, options });
            return fetch(url, options)
                .then(async (res) => ({
                    status: res.status,
                    data: await res.json()
                }))
                .then(({ status, data }) => {
                    if (status !== 200) {
                        const error = new Error(
                            `${data.type}: ${data.message}`
                        );
                        error.code = data.code;
                        error.status = status;
                        throw error;
                        return;
                    }
                    return data;
                })
                .catch((err) => {
                    throw err;
                });
        });
    };

    return getRequest;
}
