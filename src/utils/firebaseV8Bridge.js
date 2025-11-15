// 🚀 FIREBASE V9 TO V8 GLOBAL BRIDGE
// This creates the window.firebase object that diagnostic scripts expect

import { auth, db } from '../firebase.js';
import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';

console.log('🌉 Creating Firebase v8 compatibility bridge...');

// Create the global Firebase object that matches v8 API
if (typeof window !== 'undefined') {
    window.firebase = {
        // Basic info
        SDK_VERSION: '9.0.0+',
        
        // Apps management
        apps: [{ options: { projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID } }],
        app: () => ({
            options: {
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
            }
        }),
        
        // Auth function
        auth: () => ({
            currentUser: auth.currentUser,
            onAuthStateChanged: (callback) => auth.onAuthStateChanged(callback)
        }),
        
        // Firestore function  
        firestore: () => ({
            collection: (path) => ({
                add: async (data) => {
                    const collectionRef = collection(db, path);
                    const docRef = await addDoc(collectionRef, data);
                    return {
                        id: docRef.id,
                        delete: () => deleteDoc(docRef)
                    };
                },
                
                doc: (id) => {
                    const docRef = doc(db, path, id);
                    return {
                        collection: (subPath) => ({
                            add: async (data) => {
                                const subCollectionRef = collection(docRef, subPath);
                                const subDocRef = await addDoc(subCollectionRef, data);
                                return {
                                    id: subDocRef.id,
                                    delete: () => deleteDoc(subDocRef)
                                };
                            }
                        })
                    };
                },
                
                where: (field, op, value) => ({
                    get: async () => {
                        const collectionRef = collection(db, path);
                        const q = query(collectionRef, where(field, op, value));
                        const snapshot = await getDocs(q);
                        return {
                            docs: snapshot.docs.map(doc => ({
                                id: doc.id,
                                data: () => doc.data(),
                                ref: {
                                    delete: () => deleteDoc(doc.ref)
                                }
                            }))
                        };
                    }
                }),
                
                limit: (count) => ({
                    get: async () => {
                        const collectionRef = collection(db, path);
                        const q = query(collectionRef, limit(count));
                        const snapshot = await getDocs(q);
                        return {
                            docs: snapshot.docs.map(doc => ({
                                id: doc.id,
                                data: () => doc.data()
                            }))
                        };
                    }
                }),
                
                get: async () => {
                    const collectionRef = collection(db, path);
                    const snapshot = await getDocs(collectionRef);
                    return {
                        docs: snapshot.docs.map(doc => ({
                            id: doc.id,
                            data: () => doc.data()
                        }))
                    };
                }
            }),
            
            disableNetwork: () => db.disableNetwork(),
            enableNetwork: () => db.enableNetwork(),
            settings: () => {},
            _settings: {}
        })
    };
    
    console.log('✅ Firebase v8 compatibility bridge activated');
    console.log('🔥 window.firebase object created for diagnostics');
    
    // Test the bridge
    try {
        const testAuth = window.firebase.auth();
        const testDb = window.firebase.firestore();
        console.log('✅ Bridge test passed - Firebase objects accessible');
        console.log('🔍 Auth currentUser:', testAuth.currentUser?.email || 'Not logged in');
    } catch (error) {
        console.error('❌ Bridge test failed:', error);
    }
}

export default window.firebase;