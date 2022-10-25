import React, { useEffect, useState } from "react";
import { t2 } from "_utils/lang";
import { useApi } from "_api";
import { useStore } from "_store";
import useLocation from "./partner/useLocation";
import settings from "../constants/settings";

export default function usePartner() {
    const getRequest = useApi();
    const location = useLocation();

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

    const {
        auth: { partner, partnerLoaded },
        actions: { getPartner, setPartner, removePartner }
    } = useStore();

    useEffect(() => {
        if (!partner) getPartner();
    }, []);

    const updateLocation = async () => {
        const { latitude, longitude } =
            await location.actions.getCurrentPosition();

        getRequest({
            method: "POST",
            endpoint: "user/updateDriverLocation",
            params: {
                coordinates: [longitude, latitude],
                type: "Point"
            }
        });
    };

    const savePartner = () => {
        setFormError(false);
        if (/\d/.test(formPartner.firstName) || !formPartner.firstName.length) {
            setFormError(t2("errors.firstName"));
            return;
        }

        if (/\d/.test(formPartner.lastName) || !formPartner.lastName.length) {
            setFormError(t2("errors.lastName"));
            return;
        }

        if (
            !/^\d+$/.test(formPartner.phoneNumber) ||
            !formPartner.phoneNumber.length
        ) {
            setFormError(t2("errors.phoneNumber"));
            return;
        }

        if (
            !settings.REGEX.password.test(formPartner.password) ||
            !formPartner.password.length
        ) {
            setFormError(t2("errors.passwordRegex"));
            return;
        }

        if (/\d/.test(formPartner.cab.model) || !formPartner.cab.model.length) {
            setFormError(t2("errors.cabModel"));
            return;
        }

        if (!settings.REGEX.licencePlate.test(formPartner.cab.licensePlate)) {
            setFormError(t2("errors.licensePlate"));
            return;
        }

        getRequest({
            method: "POST",
            endpoint: "drivers/save",
            params: {
                ...formPartner,
                currentLocation: {
                    type: "Point",
                    coordinates: [
                        location.location?.longitude || 0,
                        location.location?.latitude || 0
                    ]
                }
            }
        })
            .then((newPartner) => {
                setPartner(newPartner);
            })
            .catch((err) => {
                console.log(err);
                setFormError(t2(err?.code || "errors.crashErrorTitle"));
            });
    };

    const loginPartner = () => {
        setFormError(false);

        if (!/^\d+$/.test(auth.phoneNumber) || !auth.phoneNumber.length) {
            setFormError(t2("errors.phoneNumber"));
            return;
        }

        if (!/[a-zA-Z0-9]{8,}/.test(auth.password) || !auth.password.length) {
            setFormError(t2("errors.passwordRegex"));
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
                setFormError(t2(err.code));
            });
    };

    const changeStatus = () => {
        setPartner({ ...partner, isOnline: !partner.isOnline });

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
                setPartner({ ...partner, isOnline: !partner.isOnline });
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
                setFormError(t2(err.code));
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

    const refresh = () => {
        getRequest({
            method: "GET",
            endpoint: "drivers/refresh"
        })
            .then((data) => {
                setPartner({ ...partner, ...data });
            })
            .catch((err) => {
                console.log(err);
                logout();
            });
    };

    const deleteAccount = () => {
        setFormError(false);

        logout();

        getRequest({
            method: "POST",
            endpoint: "drivers/delete"
        }).catch((err) => {
            console.log(err);
            setFormError(t2(err.code));
        });
    };

    const logout = () => {
        getRequest({
            method: "POST",
            endpoint: "auth/logout"
        })
            .then(() => {
                removePartner();
            })
            .catch((err) => {
                console.log(err);
                setFormError(t2(err.code));
            });
    };

    return {
        formPartner,
        formError,
        partner,
        auth,
        ridesHistory,
        partnerLoaded,
        actions: {
            savePartner,
            setFormPartner,
            setAuth,
            loginPartner,
            changeStatus,
            saveChanges,
            getRidesHistory,
            logout,
            refresh,
            deleteAccount,
            updateLocation
        }
    };
}
