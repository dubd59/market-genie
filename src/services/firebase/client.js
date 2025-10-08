import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit 
} from '../../security/SecureFirebase.js'
import { db } from '../../firebase'

// Firebase service for database operations
export class FirebaseService {
  // Generic CRUD operations
  static async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      const data = []
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() })
      })
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null }
      } else {
        return { data: null, error: { message: 'Document not found' } }
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async create(collectionName, data, customId = null) {
    try {
      let docRef
      const docData = {
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }

      if (customId) {
        // Use custom ID (for user profiles, etc.)
        docRef = doc(db, collectionName, customId)
        await setDoc(docRef, docData)
        return { data: { id: customId, ...data }, error: null }
      } else {
        // Auto-generate ID
        docRef = await addDoc(collection(db, collectionName), docData)
        return { data: { id: docRef.id, ...data }, error: null }
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updated_at: new Date()
      })
      return { data: { id, ...data }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async delete(collectionName, id) {
    try {
      await deleteDoc(doc(db, collectionName, id))
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  static async query(collectionName, conditions = [], orderByField = null, limitCount = null) {
    try {
      let q = collection(db, collectionName)
      
      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value))
      })
      
      // Add ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction || 'asc'))
      }
      
      // Add limit
      if (limitCount) {
        q = query(q, limit(limitCount))
      }
      
      const querySnapshot = await getDocs(q)
      const data = []
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() })
      })
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

export default FirebaseService
