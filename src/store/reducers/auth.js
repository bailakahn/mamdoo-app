import { auth } from "../initialState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";
export default (state = auth, action) => {
  switch (action.type) {
    case types.SET_USER:
      AsyncStorage.setItem("@mamdoo-client", JSON.stringify(action.user));
      return {
        ...state,
        user: action.user,
      };
    case types.USER_LOADED:
      return {
        ...state,
        userLoaded: true,
      };
    case types.SET_PARTNER:
      AsyncStorage.setItem("@mamdoo-partner", JSON.stringify(action.partner));
      return {
        ...state,
        partner: action.partner,
      };
    case types.ONLINE_STATUS_CHANGE:
      AsyncStorage.setItem(
        "@mamdoo-partner",
        JSON.stringify({ ...state.partner, ...action.data })
      );
      return {
        ...state,
        partner: { ...state.partner, ...action.data },
      };
    case types.PARTNER_LOADED:
      return {
        ...state,
        partnerLoaded: true,
      };
    case types.PARTNER_REFRESHED:
      return {
        ...state,
        partnerRefreshed: true,
      };
    case types.REMOVE_USER:
      return {
        ...state,
        user: null,
      };
    case types.REMOVE_PARTNER:
      return {
        ...state,
        partner: null,
      };
    case types.SET_UPLOAD_DOCUMENTS:
      return {
        ...state,
        uploadDocuments: action.documents,
      };
    case types.SET_UPLOAD_DOCUMENT:
      return {
        ...state,
        uploadDocuments: {
          ...state.uploadDocuments,
          [action.key]: action.document,
        },
      };
    case types.SET_DOCUMENTS_SUBMITTED:
      return {
        ...state,
        documentsSubmitted: action.value,
      };
    case types.SET_CARPOOL_DRIVER:
      AsyncStorage.setItem("@mamdoo-carpoolDriver", JSON.stringify(action.carpoolDriver));
      return {
        ...state,
        carpoolDriver: action.carpoolDriver,
      };
    case types.REMOVE_CARPOOL_DRIVER:
      AsyncStorage.removeItem("@mamdoo-carpoolDriver");
      return {
        ...state,
        carpoolDriver: null,
        carpoolUploadDocuments: {},
        carpoolDocumentsSubmitted: false,
      };
    case types.CARPOOL_DRIVER_LOADED:
      return {
        ...state,
        carpoolDriverLoaded: true,
      };
    case types.CARPOOL_DRIVER_REFRESHED:
      return {
        ...state,
        carpoolDriverRefreshed: true,
      };
    default:
      return state;
  }
};
