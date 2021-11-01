import React, { useEffect, useState } from "react";
import { useStore } from "_store";
// const baseUrl = "http://192.168.2.133:3005/";
const baseUrl = "https://3u5ytlhfna.execute-api.us-east-1.amazonaws.com/prod/";

import AsyncStorage from "@react-native-async-storage/async-storage";

export function useApi() {
    const {
        main: { app },
        auth: { user = {}, partner = {} }
    } = useStore();

    const getRequest = ({ method = "GET", endpoint, params }) => {
        let url = baseUrl + endpoint;

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

            let url = baseUrl + endpoint;

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
