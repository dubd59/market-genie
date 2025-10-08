import { addDoc, collection } from "./security/SecureFirebase.js";
import { serverTimestamp } from "firebase/firestore";
import { db } from './firebase';

// MARKET GENIE ISOLATED - NO CROSS-APP SHARING
export const shareAcrossApps = async (dataType, data, targetApps) => {
  const shareDoc = {
    sourceApp: 'MarketGenie',
    targetApps: ['MarketGenie'], // ISOLATED TO MARKET GENIE ONLY
    dataType,
    data,
    sharedAt: serverTimestamp()
  };
  await addDoc(collection(db, "MarketGenie_InternalSharing"), shareDoc);
};
