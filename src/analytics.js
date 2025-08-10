import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from './firebase';

export const trackEvent = async (eventName, eventData = {}) => {
  try {
    await addDoc(collection(db, "analytics"), {
      event: eventName,
      app: import.meta.env.VITE_APP_NAME,
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
