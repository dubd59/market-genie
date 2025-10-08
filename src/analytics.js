import { addDoc, collection } from "./security/SecureFirebase.js";
import { serverTimestamp } from "firebase/firestore";
import { db, auth } from './firebase';

export const trackEvent = async (eventName, eventData = {}) => {
  try {
    await addDoc(collection(db, "MarketGenie_Analytics"), {
      event: eventName,
      app: 'MarketGenie',
      data: eventData,
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid,
      sessionId: sessionStorage.getItem('sessionId') || Date.now().toString()
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
};

export const trackUserAction = (action, details) => 
  trackEvent('user_action', { action, ...details });

export const trackPageView = (page) => 
  trackEvent('page_view', { page });

export const trackError = (error, context) => 
  trackEvent('error', { error: error.message, context });
