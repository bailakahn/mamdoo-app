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
    pin: "",
    cab: { model: "", licensePlate: "", owner: false },
    municipality: "Ratoma",
    neighborhood: "",
    base: "",
  });

  const [auth, setAuth] = useState({ phoneNumber: "", pin: "" });
  const [formError, setFormError] = useState(false);
  const [ridesHistory, setRidesHistory] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  const [forgotPinUser, setForgotPinUser] = useState({
    phoneNumber: "",
    pin: "",
    pinValidation: "",
    code: "",
  });

  const [forgotPinError, setForgotPinError] = useState(false);

  const {
    auth: { partner, partnerLoaded, uploadDocuments },
    actions: { getPartner, setPartner, removePartner, setUploadDocuments },
  } = useStore();

  useEffect(() => {
    if (!partner) getPartner();
  }, []);

  const updateLocation = async () => {
    const { latitude, longitude } = await location.actions.getCurrentPosition();

    getRequest({
      method: "POST",
      endpoint: "user/updateDriverLocation",
      params: {
        coordinates: [longitude, latitude],
        type: "Point",
      },
    });
  };

  const savePartner = () => {
    setIsLoading(true);
    setFormError(false);
    if (/\d/.test(formPartner.firstName) || !formPartner.firstName.length) {
      setFormError(t2("errors.firstName"));
      setIsLoading(false);
      return;
    }

    if (/\d/.test(formPartner.lastName) || !formPartner.lastName.length) {
      setFormError(t2("errors.lastName"));
      setIsLoading(false);
      return;
    }

    if (
      !/^\d+$/.test(formPartner.phoneNumber) ||
      !formPartner.phoneNumber.length
    ) {
      setIsLoading(false);
      setFormError(t2("errors.phoneNumber"));
      return;
    }

    if (/\d/.test(formPartner.cab.model) || !formPartner.cab.model.length) {
      setIsLoading(false);
      setFormError(t2("errors.cabModel"));
      return;
    }

    // if (!settings.REGEX.licencePlate.test(formPartner.cab.licensePlate)) {
    //   setIsLoading(false);
    //   setFormError(t2("errors.licensePlate"));
    //   return;
    // }

    getRequest({
      method: "POST",
      endpoint: "drivers/save",
      params: {
        ...formPartner,
        currentLocation: {
          type: "Point",
          coordinates: [
            location.location?.longitude || 0,
            location.location?.latitude || 0,
          ],
        },
      },
    })
      .then((newPartner) => {
        setPartner(newPartner);
      })
      .catch((err) => {
        console.log(err);
        setFormError(t2(err?.code || "errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loginPartner = () => {
    setIsLoading(true);
    setFormError(false);

    if (!/^\d+$/.test(auth.phoneNumber) || !auth.phoneNumber.length) {
      setIsLoading(false);
      setFormError(t2("errors.phoneNumber"));
      return;
    }

    getRequest({
      method: "POST",
      endpoint: "auth/login",
      params: auth,
    })
      .then((user) => {
        setPartner(user);
      })
      .catch((err) => {
        console.log(err);
        setFormError(t2(err.code || "errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const changeStatus = () => {
    setIsLoading(true);
    setPartner({ ...partner, isOnline: !partner.isOnline });

    getRequest({
      method: "POST",
      endpoint: "drivers/status",
      params: auth,
    })
      .then(({ isOnline }) => {
        setPartner({ ...partner, isOnline });
      })
      .catch((err) => {
        console.log(err);
        setPartner({ ...partner, isOnline: !partner.isOnline });
        // setFormError(t(err.code));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const saveChanges = (editPartner, setShowSuccess, setIsEdit) => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "drivers/edit",
      params: {
        ...editPartner,
        _id: partner.userId,
        cab: undefined,
        phoneNumber: undefined,
      },
    })
      .then((newValues) => {
        setPartner({ ...partner, ...newValues });
        setShowSuccess(true);
        setTimeout(() => {
          setIsEdit(false);
          setShowSuccess(false);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
        setFormError(t2(err.code || "errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getRidesHistory = () => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "rides/drivers/history",
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
      endpoint: "rides/drivers/history",
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
      endpoint: "drivers/refresh",
    })
      .then((data) => {
        setPartner({ ...partner, ...data });
      })
      .catch((err) => {
        console.log(err);
        logout();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteAccount = () => {
    setIsLoading(true);
    setFormError(false);

    logout();

    getRequest({
      method: "POST",
      endpoint: "drivers/delete",
    })
      .catch((err) => {
        console.log(err);
        setFormError(t2(err.code || "errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const logout = () => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "auth/logout",
    })
      .then(() => {
        removePartner();
      })
      .catch((err) => {
        console.log(err);
        setFormError(t2(err.code || "errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const verifyAccount = () => {
    setIsLoading(true);
    if (!verificationCode) {
      setIsLoading(false);
      setVerificationError(t("errors.empty"));
    }

    getRequest({
      method: "POST",
      endpoint: "auth/verifyAccount",
      params: {
        code: verificationCode,
      },
    })
      .then((res) => {
        console.log({ res });
        if (res.success) setPartner({ ...partner, verified: true });
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

  const resend = () => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "auth/resend-no-auth",
      params: {
        phoneNumber: partner?.phoneNumber,
        app: "partner",
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
    setPartner({ phoneNumber: forgotPinUser.phoneNumber });
    getRequest({
      method: "POST",
      endpoint: "drivers/forgotPin",
      params: {
        phoneNumber: forgotPinUser.phoneNumber,
      },
    })
      .then(({ success }) => {
        if (success) navigation.navigate("ResetPin");
        else setForgotPinError(t("errors.phoneNumber"));
      })
      .catch((err) => {
        console.log(err);
        setForgotPinError(t("errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resetPin = () => {
    setIsLoading(true);
    if (
      !partner.phoneNumber ||
      !forgotPinUser.pin ||
      !forgotPinUser.pinValidation ||
      forgotPinUser.pin !== forgotPinUser.pinValidation
    ) {
      setIsLoading(false);
      setVerificationError(t2("errors.pinValidation"));
      return;
    }

    getRequest({
      method: "POST",
      endpoint: "drivers/resetpin",
      params: { ...forgotPinUser, phoneNumber: partner?.phoneNumber },
    })
      .then((user) => {
        setPartner(user);
      })
      .catch((err) => {
        console.log(err);
        setVerificationError(t("errors.invalidCode"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const uploadDocumentsToS3 = (navigation) => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "drivers/uploadDocuments",
      params: Object.keys(uploadDocuments).reduce((acc, key) => {
        acc[key] = "data:image/jpeg;base64," + uploadDocuments[key]?.base64;
        return acc;
      }, {}),
    })
      .then((data) => {
        // setPartner({ ...partner, ...data });
        navigation.navigate("Confirmation");
      })
      .catch((err) => {
        console.log(err);
        setUploadError(t("errors.crashErrorTitle"));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const saveTime = (time) => {
    getRequest({
      method: "POST",
      endpoint: "drivers/savetime",
      params: {
        time,
      },
    }).catch((err) => {
      console.log(err);
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
    forgotPinUser,
    forgotPinError,
    isLoading,
    uploadDocuments,
    uploadError,
    actions: {
      savePartner,
      setFormPartner,
      setAuth,
      loginPartner,
      changeStatus,
      saveChanges,
      getRidesHistory,
      getMoreRidesHistory,
      logout,
      refresh,
      deleteAccount,
      updateLocation,
      verifyAccount,
      resend,
      setVerificationCode,
      setForgotPinUser,
      sendForgotPinVerification,
      resetPin,
      setIsLoading,
      setUploadDocuments,
      uploadDocumentsToS3,
      setPartner,
      saveTime,
    },
  };
}
