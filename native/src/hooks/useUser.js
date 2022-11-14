import React, { useEffect, useState } from "react";
import { t } from "_utils/lang";
import { useApi } from "_api";
import { useStore } from "_store";
export default function useUser() {
    const getRequest = useApi();

    const {
        auth: { user, userLoaded },
        actions: { getUser, setUser, removeUser }
    } = useStore();

    useEffect(() => {
        if (!user) getUser();
    }, []);

    const [formUser, setFormUser] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        pin: ""
    });

    const [verificationCode, setVerificationCode] = useState("");
    const [verificationError, setVerificationError] = useState(false);

    const [auth, setAuth] = useState({ phoneNumber: "", pin: "" });

    const [formError, setFormError] = useState(false);
    const [ridesHistory, setRidesHistory] = useState([]);

    const saveUser = () => {
        setFormError(false);
        if (/\d/.test(formUser.firstName) || !formUser.firstName.length) {
            setFormError(t("errors.firstName"));
            return;
        }

        if (/\d/.test(formUser.lastName) || !formUser.lastName.length) {
            setFormError(t("errors.lastName"));
            return;
        }

        if (
            !/^\d+$/.test(formUser.phoneNumber) ||
            !formUser.phoneNumber.length
        ) {
            setFormError(t("errors.phoneNumber"));
            return;
        }

        if (formUser.pin.length !== 4) {
            setFormError(t("errors.pin"));
            return;
        }

        getRequest({
            method: "POST",
            endpoint: "user/saveuser",
            params: formUser
        })
            .then((newUser) => {
                setUser(newUser);
            })
            .catch((err) => {
                console.log(err);
                setFormError(t(err.code || "errors.crashErrorTitle"));
            });
    };

    const saveChanges = (editUser, setShowSuccess) => {
        getRequest({
            method: "POST",
            endpoint: "user/edit",
            params: {
                ...editUser,
                _id: user.userId
            }
        })
            .then((newValues) => {
                setUser({ ...user, ...newValues });
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                }, 1000);
            })
            .catch((err) => {
                console.log(err);
                setFormError(t(err.code || "errors.crashErrorTitle"));
            });
    };

    const getRidesHistory = () => {
        getRequest({
            method: "GET",
            endpoint: "rides/clients/history"
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
            endpoint: "user/get"
        })
            .then((data) => {
                setUser({ ...user, ...data });
            })
            .catch((err) => {
                console.log(err);
                logout();
            });
    };

    const loginUser = () => {
        setFormError(false);

        if (!/^\d+$/.test(auth.phoneNumber) || auth.phoneNumber.length !== 9) {
            setFormError(t("errors.phoneNumber"));
            return;
        }

        if (auth.pin.length !== 4) {
            setFormError(t("errors.pin"));
            return;
        }

        getRequest({
            method: "POST",
            endpoint: "auth/user/login",
            params: auth
        })
            .then((user) => {
                setUser(user);
            })
            .catch((err) => {
                console.log(err);
                setFormError(t(err.code || "errors.crashErrorTitle"));
            });
    };

    const deleteAccount = () => {
        setFormError(false);

        logout();

        getRequest({
            method: "POST",
            endpoint: "user/delete"
        })
            .then(() => {})
            .catch((err) => {
                console.log(err);
                setFormError(t(err.code || "errors.crashErrorTitle"));
            });
    };

    const logout = () => {
        removeUser();
    };

    const verify = () => {
        if (!verificationCode) setVerificationError(t("errors.empty"));

        getRequest({
            method: "POST",
            endpoint: "auth/verify",
            params: {
                code: verificationCode
            }
        })
            .then((res) => {
                if (res.success) setUser({ ...user, verified: true });
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

    return {
        formUser,
        formError,
        user,
        userLoaded,
        ridesHistory,
        auth,
        verificationCode,
        verificationError,
        actions: {
            saveUser,
            setFormUser,
            saveChanges,
            getRidesHistory,
            logout,
            setAuth,
            loginUser,
            deleteAccount,
            refresh,
            setVerificationCode,
            verify,
            resend
        }
    };
}
