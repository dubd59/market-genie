
import { db } from '../firebase';
import { collection, addDoc, getDocs } from '../security/SecureFirebase.js';

// Create a new support ticket - MARKET GENIE ONLY
export async function createSupportTicket(ticketData) {
  await addDoc(collection(db, 'MarketGenie_SupportTickets'), ticketData);
}

// Get all support tickets - MARKET GENIE ONLY
export async function getSupportTickets() {
  const querySnapshot = await getDocs(collection(db, 'MarketGenie_SupportTickets'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
