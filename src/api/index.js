import React, { useEffect, useState } from "react";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { useStore } from "_store";
import { t } from "_utils/lang"; // without this line it didn't work

const PROVIDER_URL = process.env.EXPO_PUBLIC_PROVIDER_URL;

var alertShown = false;
export function useApi() {
  const {
    main: { app },
    auth: { user = {}, partner = {} },
    actions: { removeUser, removePartner },
  } = useStore();

  const getRequest = ({ method = "GET", endpoint, params }) => {
    let url = PROVIDER_URL + endpoint;

    const options = {
      headers: {
        app,
        "x-mamdoo-access-token":
          app === "client" ? user?.accessToken : partner?.accessToken,
        "x-application-version": Application.nativeApplicationVersion,
        "x-build-version": Application.nativeBuildVersion,
        "x-os-type": Platform.OS,
      },
      method,
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
        data: await res.json(),
      }))
      .then(({ status, data }) => {
        if (status !== 200) {
          if (
            [
              "errors.userBlocked",
              "errors.noUser",
              "errors.incompatibleAppVersion",
            ].includes(data.code) &&
            !alertShown
          ) {
            Alert.alert(
              t(data?.code ? `${data?.code}Title` : "errors.crashErrorTitle"),
              t(data?.code || "errors.crashErrorTitle"),
              [
                {
                  text: "OK",
                  onPress: () => {
                    alertShown = false;
                    if (app === "client") removeUser();
                    else removePartner();
                  },
                },
              ]
            );
            alertShown = true;
          }
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
          "x-mamdoo-access-token": partner?.accessToken,
        },
        method,
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
          data: await res.json(),
        }))
        .then(({ status, data }) => {
          if (status !== 200) {
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
    });
  };

  return getRequest;
}
