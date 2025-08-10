import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from './firebase';

export const shareAcrossApps = async (dataType, data, targetApps) => {
  const shareDoc = {
    sourceApp: import.meta.env.VITE_APP_NAME,
    targetApps,
    dataType,
    data,
    sharedAt: serverTimestamp()
  };
  await addDoc(collection(db, "cross_app_sharing"), shareDoc);
};
