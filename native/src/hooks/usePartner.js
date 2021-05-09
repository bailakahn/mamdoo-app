import React, { useEffect, useState } from "react";
import { t } from "_utils/lang";
import { useApi } from "_api";
import { useStore } from "_store";
export default function usePartner() {
    const getRequest = useApi();

    const [isLoading, setIsLoading] = useState(true);

    const {
        auth: { partner },
        actions: { getPartner, setPartner, removePartner }
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
    const [ridesHistory, setRidesHistory] = useState([]);

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
                setPartner(newPartner);
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

    const changeStatus = () => {
        getRequest({
            method: "POST",
            endpoint: "drivers/status",
            params: auth
        })
            .then(({ isOnline }) => {
                setPartner({ ...partner, isOnline });
            })
            .catch((err) => {
                console.log(err);
                // setFormError(t(err.code));
            });
    };

    const saveChanges = (editPartner, setShowSuccess) => {
        getRequest({
            method: "POST",
            endpoint: "drivers/edit",
            params: {
                ...editPartner,
                _id: partner.userId,
                cab: undefined,
                phoneNumber: undefined
            }
        })
            .then((newValues) => {
                setPartner({ ...partner, ...newValues });
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                }, 1000);
            })
            .catch((err) => {
                console.log(err);
                setFormError(t(err.code));
            });
    };

    const getRidesHistory = () => {
        getRequest({
            method: "GET",
            endpoint: "rides/drivers/history"
        })
            .then((data) => {
                setRidesHistory(data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return {
        formPartner,
        formError,
        partner,
        auth,
        ridesHistory,
        isLoading,
        actions: {
            savePartner,
            setFormPartner,
            setAuth,
            loginPartner,
            changeStatus,
            saveChanges,
            getRidesHistory,
            logout: () => removePartner()
        }
    };
}
