
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Create a new support ticket
export async function createSupportTicket(ticketData) {
  await addDoc(collection(db, 'SupportGenie'), ticketData);
}

// Get all support tickets
export async function getSupportTickets() {
  const querySnapshot = await getDocs(collection(db, 'SupportGenie'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
