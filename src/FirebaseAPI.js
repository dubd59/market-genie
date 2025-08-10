import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  limit,
  startAfter,
  onSnapshot,
  increment
} from "firebase/firestore";
import { db } from './firebase';

export class FirebaseAPI {
  constructor(collectionName) {
    this.collection = collectionName;
  }

  async create(data) {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${this.collection}:`, error);
      throw error;
    }
  }

  async read(filters = {}, pagination = {}) {
    try {
      let q = collection(db, this.collection);
      Object.entries(filters).forEach(([field, value]) => {
        q = query(q, where(field, "==", value));
      });
      q = query(q, orderBy("createdAt", "desc"));
      if (pagination.limit) {
        q = query(q, limit(pagination.limit));
      }
      if (pagination.lastDoc) {
        q = query(q, startAfter(pagination.lastDoc));
      }
      const querySnapshot = await getDocs(q);
      const documents = [];
      let lastVisible = null;
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
        lastVisible = doc;
      });
      return { documents, lastVisible };
    } catch (error) {
      console.error(`Error reading ${this.collection}:`, error);
      throw error;
    }
  }

  async update(docId, updates) {
    try {
      const docRef = doc(db, this.collection, docId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating ${this.collection}:`, error);
      throw error;
    }
  }

  async delete(docId) {
    try {
      await deleteDoc(doc(db, this.collection, docId));
    } catch (error) {
      console.error(`Error deleting ${this.collection}:`, error);
      throw error;
    }
  }

  subscribe(filters = {}, callback) {
    try {
      let q = collection(db, this.collection);
      Object.entries(filters).forEach(([field, value]) => {
        q = query(q, where(field, "==", value));
      });
      q = query(q, orderBy("updatedAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const documents = [];
        snapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
      });
    } catch (error) {
      console.error(`Error subscribing to ${this.collection}:`, error);
      throw error;
    }
  }
}
