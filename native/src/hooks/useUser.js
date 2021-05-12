import React, { useEffect, useState } from "react";
import { t } from "_utils/lang";
import { useApi } from "_api";
import { useStore } from "_store";
export default function useUser() {
    const getRequest = useApi();

    const {
        auth: { user, userLoaded },
        actions: { getUser, setUser }
    } = useStore();

    useEffect(() => {
        if (!user) getUser();
    }, []);

    const [formUser, setFormUser] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: ""
    });

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
                setFormError(t(err.code));
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
                setFormError(t(err.code));
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

    return {
        formUser,
        formError,
        user,
        userLoaded,
        ridesHistory,
        actions: { saveUser, setFormUser, saveChanges, getRidesHistory }
    };
}
