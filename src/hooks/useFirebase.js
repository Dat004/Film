// import { useState } from "react";
// import { get, set, update, remove, ref } from "firebase/database";

// const useFirebase = () => {
//   const [error, setError] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const getData = async (path = "") => {
//     setLoading(true);
//     setError(false);
//     const dbRef = ref(db, path);
    
//     try {
//       const snapshot = await get(dbRef);

//       return snapshot;
//     } catch (e) {
//       setError(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setData = async (path = "", options = {}) => {
//     setLoading(true);
//     setError(false);
//     const dbRef = ref(db, path);

//     try {
//       await set(dbRef, options);
//     } catch (e) {
//       setError(true);
//     }
//   };

//   const updateData = async (path = "", options = {}) => {
//     setLoading(true);
//     setError(false);
//     const dbRef = ref(db, path);

//     try {
//       await update(dbRef, options);
//     } catch (e) {
//       setError(true);
//     }
//   };

//   return { error, loading, getData, setData, updateData };
// };

// export default useFirebase;
