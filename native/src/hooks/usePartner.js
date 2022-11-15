import React, { useEffect, useState } from "react";
import { t2, t } from "_utils/lang";
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

    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState(false);

    const [forgotPasswordUser, setForgotPasswordUser] = useState({
        phoneNumber: "",
        password: "",
        passwordValidation: "",
        code: ""
    });

    const [forgotPasswordError, setForgotPasswordError] = useState(false);

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
                setFormError(t2(err.code || "errors.crashErrorTitle"));
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
                setFormError(t2(err.code || "errors.crashErrorTitle"));
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
            setFormError(t2(err.code || "errors.crashErrorTitle"));
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
                setFormError(t2(err.code || "errors.crashErrorTitle"));
            });
    };

    const verifyAccount = () => {
        if (!verificationCode) setVerificationError(t("errors.empty"));

        getRequest({
            method: "POST",
            endpoint: "auth/verifyAccount",
            params: {
                code: verificationCode
            }
        })
            .then((res) => {
                console.log({ res });
                if (res.success) setPartner({ ...partner, verified: true });
                else {
                    if (res?.isUsed) setVerificationError(t("errors.isUsed"));
                    else if (res?.expired)
                        setVerificationError(t("errors.expired"));
                    else if (res?.notFound)
                        setVerificationError(t("errors.notFound"));
                    else setVerificationError(t("errors.invalidCode"));
                }
            })
            .catch((err) => {
                console.log(err);
                setVerificationError(t("errors.invalidCode"));
            });
    };

    const resend = () => {
        getRequest({
            method: "POST",
            endpoint: "auth/resend"
        }).catch((err) => {
            console.log(err);
            setVerificationError(t("errors.crashErrorTitle"));
        });
    };

    const sendForgotPasswordVerification = (navigation) => {
        setPartner({ phoneNumber: forgotPasswordUser.phoneNumber });
        getRequest({
            method: "POST",
            endpoint: "drivers/forgotPassword",
            params: {
                phoneNumber: forgotPasswordUser.phoneNumber
            }
        })
            .then(({ success }) => {
                if (success) navigation.navigate("ResetPassword");
                else setForgotPasswordError(t("errors.phoneNumber"));
            })
            .catch((err) => {
                console.log(err);
                setForgotPasswordError(t("errors.crashErrorTitle"));
            });
    };

    const resetPassword = () => {
        if (
            !partner.phoneNumber ||
            !forgotPasswordUser.password ||
            !forgotPasswordUser.passwordValidation ||
            forgotPasswordUser.password !==
                forgotPasswordUser.passwordValidation
        )
            setVerificationError(t("errors.empty"));

        getRequest({
            method: "POST",
            endpoint: "drivers/resetpassword",
            params: { ...forgotPasswordUser, phoneNumber: partner?.phoneNumber }
        })
            .then((user) => {
                setPartner(user);
            })
            .catch((err) => {
                console.log(err);
                setVerificationError(t("errors.invalidCode"));
            });
    };

    return {
        formPartner,
        formError,
        partner,
        auth,
        ridesHistory,
        partnerLoaded,
        verificationCode,
        verificationError,
        forgotPasswordUser,
        forgotPasswordError,
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
            updateLocation,
            verifyAccount,
            resend,
            setVerificationCode,
            setForgotPasswordUser,
            sendForgotPasswordVerification,
            resetPassword
        }
    };
}
