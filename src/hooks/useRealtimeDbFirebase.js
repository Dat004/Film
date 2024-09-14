import { getDatabase, ref, get, set, update, remove } from "firebase/database";

import { ToastMessage } from "../components/Toastify";

const useRealtimeDbFirebase = () => {
  const db = getDatabase();

  const getDb = async ({
    path = "",
    callback = () => {},
    fallback = () => {},
    messageSuccess = "",
    messageError = "",
  }) => {
    const dbRef = ref(db, path);

    try {
      const snapshot = await get(dbRef);

      if (messageSuccess) ToastMessage.success(messageSuccess);
      return callback(snapshot);
    } catch (err) {
      if (messageError) ToastMessage.err(messageError);

      return fallback(err);
    }
  };

  const setDb = async ({
    path = "",
    options = {},
    messageSuccess = "",
    messageError = "",
  }) => {
    const dbRef = ref(db, path);

    try {
      await set(dbRef, options);

      if (messageSuccess) ToastMessage.success(messageSuccess);
    } catch (err) {
      if (messageError) ToastMessage.err(messageError);

      return err;
    }
  };

  const updateDb = async ({
    path = "",
    options = {},
    messageSuccess = "",
    messageError = "",
  }) => {
    const dbRef = ref(db, path);

    try {
      await update(dbRef, options);

      if (messageSuccess) ToastMessage.success(messageSuccess);
    } catch (err) {
      if (messageError) ToastMessage.err(messageError);

      return err;
    }
  };

  const removeDb = async ({
    path = "",
    messageSuccess = "",
    messageError = "",
  }) => {
    const dbRef = ref(db, path);

    try {
      await remove(dbRef);

      if (messageSuccess) ToastMessage.success(messageSuccess);
    } catch (err) {
      if (messageError) ToastMessage.err(messageError);

      return err;
    }
  };

  return { getDb, setDb, updateDb, removeDb };
};

export default useRealtimeDbFirebase;
