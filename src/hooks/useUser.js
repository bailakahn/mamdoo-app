import React, { useEffect, useState } from "react";
import { t } from "_utils/lang";
import { useApi } from "_api";
import { useStore } from "_store";
import useLocation from "./partner/useLocation";

export default function useUser() {
  const getRequest = useApi();
  const location = useLocation();

  const {
    auth: { user, userLoaded },
    actions: { getUser, setUser, removeUser },
  } = useStore();

  useEffect(() => {
    if (!user) getUser();
  }, []);

  const [formUser, setFormUser] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    pin: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState(false);

  const [auth, setAuth] = useState({ phoneNumber: "", pin: "" });

  const [forgotPasswordUser, setForgotPasswordUser] = useState({
    phoneNumber: "",
    pin: "",
    pinValidation: "",
    code: "",
  });

  const [forgotPasswordError, setForgotPasswordError] = useState(false);

  const [formError, setFormError] = useState(false);
  const [ridesHistory, setRidesHistory] = useState([]);

  const saveUser = () => {
    setFormError(false);
    setIsLoading(true);
    if (/\d/.test(formUser.firstName) || !formUser.firstName.length) {
      setFormError(t("errors.firstName"));
      setIsLoading(false);
      return;
    }

    if (/\d/.test(formUser.lastName) || !formUser.lastName.length) {
      setFormError(t("errors.lastName"));
      setIsLoading(false);
      return;
    }

    if (!/^\d+$/.test(formUser.phoneNumber) || !formUser.phoneNumber.length) {
      setFormError(t("errors.phoneNumber"));
      setIsLoading(false);
      return;
    }

    if (formUser.pin.length !== 4) {
      setFormError(t("errors.pin"));
      setIsLoading(false);
      return;
    }

    getRequest({
      method: "POST",
      endpoint: "user/saveuser",
      params: formUser,
    })
      .then((newUser) => {
        setUser(newUser);
      })
      .catch((err) => {
        console.log(err);
        setFormError(t(err.code || "errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const saveChanges = (editUser, setShowSuccess, setIsEdit) => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "user/edit",
      params: {
        ...editUser,
        _id: user.userId,
      },
    })
      .then((newValues) => {
        setUser({ ...user, ...newValues });
        setShowSuccess(true);
        setTimeout(() => {
          setIsEdit(false);
          setShowSuccess(false);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
        setFormError(t(err.code || "errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getRidesHistory = () => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "rides/clients/history",
    })
      .then((data) => {
        setRidesHistory(data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getMoreRidesHistory = (from) => {
    getRequest({
      method: "POST",
      endpoint: "rides/clients/history",
      params: { from },
    })
      .then((data) => {
        setRidesHistory([...ridesHistory, ...data]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const refresh = () => {
    setIsLoading(true);
    getRequest({
      method: "GET",
      endpoint: "user/get",
    })
      .then((data) => {
        setUser({ ...user, ...data });
      })
      .catch((err) => {
        console.log(err);
        logout();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loginUser = () => {
    setFormError(false);
    setIsLoading(true);
    if (!/^\d+$/.test(auth.phoneNumber) || auth.phoneNumber.length !== 9) {
      setFormError(t("errors.phoneNumber"));
      setIsLoading(false);

      return;
    }

    if (auth.pin.length !== 4) {
      setFormError(t("errors.pin"));
      setIsLoading(false);

      return;
    }

    getRequest({
      method: "POST",
      endpoint: "auth/user/login",
      params: auth,
    })
      .then((user) => {
        setUser(user);
      })
      .catch((err) => {
        console.log(err);
        setFormError(t(err.code || "errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteAccount = () => {
    setFormError(false);
    setIsLoading(true);

    getRequest({
      method: "POST",
      endpoint: "user/delete",
    })
      .catch((err) => {
        console.log(err);
        setFormError(t(err.code || "errors.crashErrorTitle"));
      })
      .finally(() => {
        logout();
        setIsLoading(false);
      });
  };

  const logout = () => {
    removeUser();
  };

  const verifyAccount = () => {
    setIsLoading(true);

    if (!verificationCode) setVerificationError(t("errors.empty"));

    getRequest({
      method: "POST",
      endpoint: "auth/verifyAccount",
      params: {
        code: verificationCode,
      },
    })
      .then((res) => {
        if (res.success) setUser({ ...user, verified: true });
        else {
          if (res?.isUsed) setVerificationError(t("errors.isUsed"));
          else if (res?.expired) setVerificationError(t("errors.expired"));
          else if (res?.notFound) setVerificationError(t("errors.notFound"));
          else setVerificationError(t("errors.invalidCode"));
        }
      })
      .catch((err) => {
        console.log(err);
        setVerificationError(t("errors.invalidCode"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resetPin = () => {
    setIsLoading(true);

    if (
      !user.phoneNumber ||
      !forgotPasswordUser.code ||
      !forgotPasswordUser.pin ||
      !forgotPasswordUser.pinValidation ||
      forgotPasswordUser.pin !== forgotPasswordUser.pinValidation
    ) {
      setVerificationError(t("errors.empty"));
      setIsLoading(false);
      return;
    }

    getRequest({
      method: "POST",
      endpoint: "auth/resetpin",
      params: { ...forgotPasswordUser, phoneNumber: user?.phoneNumber },
    })
      .then((user) => {
        setUser(user);
      })
      .catch((err) => {
        console.log(err);
        setVerificationError(t("errors.invalidCode"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resend = () => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "auth/resend-no-auth",
      params: {
        phoneNumber: user?.phoneNumber,
        app: "client",
      },
    })
      .catch((err) => {
        console.log(err);
        setVerificationError(t("errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const sendForgotPinVerification = (navigation) => {
    setIsLoading(true);
    setUser({ phoneNumber: forgotPasswordUser.phoneNumber });
    getRequest({
      method: "POST",
      endpoint: "auth/forgotPin",
      params: {
        phoneNumber: forgotPasswordUser.phoneNumber,
      },
    })
      .then(({ success }) => {
        if (success) navigation.navigate("ResetPin");
        else setForgotPasswordError(t("errors.phoneNumber"));
      })
      .catch((err) => {
        console.log(err);
        setForgotPasswordError(t("errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateLocation = async () => {
    const { latitude, longitude } = await location.actions.getCurrentPosition();

    getRequest({
      method: "POST",
      endpoint: "user/updateLocation",
      params: {
        coordinates: [longitude, latitude],
        type: "Point",
      },
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
    forgotPasswordUser,
    forgotPasswordError,
    isLoading,
    actions: {
      updateLocation,
      saveUser,
      setFormUser,
      saveChanges,
      getRidesHistory,
      getMoreRidesHistory,
      logout,
      setAuth,
      loginUser,
      deleteAccount,
      refresh,
      setVerificationCode,
      verifyAccount,
      resetPin,
      resend,
      setForgotPasswordUser,
      sendForgotPinVerification,
      setIsLoading,
    },
  };
}
