import React, { useEffect, useState } from "react";
import { t } from "_utils/lang";
import { useApi } from "_api";
import { useStore } from "_store";
export default function usePartner() {
    const getRequest = useApi();

    const [isLoading, setIsLoading] = useState(true);

    const {
        auth: { partner },
        actions: { getPartner, setPartner }
    } = useStore();

    useEffect(() => {
        getPartner();
        setIsLoading(false);
    }, []);

    const [formPartner, setFormPartner] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        password: "",
        cab: { model: "", licensePlate: "" }
    });

    const [auth, setAuth] = useState({ phoneNumber: "", password: "" });

    const [formError, setFormError] = useState(false);

    const savePartner = () => {
        setFormError(false);
        if (/\d/.test(formPartner.firstName) || !formPartner.firstName.length) {
            setFormError(t("errors.firstName"));
            return;
        }

        if (/\d/.test(formPartner.lastName) || !formPartner.lastName.length) {
            setFormError(t("errors.lastName"));
            return;
        }

        if (
            !/^\d+$/.test(formPartner.phoneNumber) ||
            !formPartner.phoneNumber.length
        ) {
            setFormError(t("errors.phoneNumber"));
            return;
        }

        if (
            !/[a-zA-Z0-9]{8,}/.test(formPartner.password) ||
            !formPartner.password.length
        ) {
            setFormError(t("errors.passwordRegex"));
            return;
        }

        if (/\d/.test(formPartner.cab.model) || !formPartner.cab.model.length) {
            setFormError(t("errors.cabModel"));
            return;
        }

        if (!/^[A-Z]{1,2}\d{4}$/.test(formPartner.cab.licensePlate)) {
            setFormError(t("errors.licensePlate"));
            return;
        }

        getRequest({
            method: "POST",
            endpoint: "drivers/save",
            params: formPartner
        })
            .then((newPartner) => {
                // setPartner(newPartner);
            })
            .catch((err) => {
                console.log(err);
                setFormError(t(err.code));
            });
    };

    const loginPartner = () => {
        setFormError(false);

        if (!/^\d+$/.test(auth.phoneNumber) || !auth.phoneNumber.length) {
            setFormError(t("errors.phoneNumber"));
            return;
        }

        if (!/[a-zA-Z0-9]{8,}/.test(auth.password) || !auth.password.length) {
            setFormError(t("errors.passwordRegex"));
            return;
        }

        getRequest({
            method: "POST",
            endpoint: "auth/login",
            params: auth
        })
            .then((user) => {
                setPartner(user);
            })
            .catch((err) => {
                console.log(err);
                setFormError(t(err.code));
            });
    };

    return {
        formPartner,
        formError,
        partner,
        auth,
        isLoading,
        actions: { savePartner, setFormPartner, setAuth, loginPartner }
    };
}
