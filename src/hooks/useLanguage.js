import React, { useEffect } from "react";
import { useApi } from "_api";
import { lang } from "_utils/lang";

export default function useLanguage() {
    const getRequest = useApi();

    useEffect(() => {
        saveLanguage(lang);
    }, []);

    const saveLanguage = (lang) => {
        getRequest({
            method: "POST",
            endpoint: "user/saveLanguage",
            params: {
                lang
            }
        }).catch((err) => {
            console.log(err);
        });
    };

    return {
        actions: {}
    };
}
