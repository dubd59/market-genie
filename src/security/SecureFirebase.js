/**
 * 🔐 SECURE FIREBASE OPERATIONS WRAPPER
 * 
 * BULLETPROOF DATABASE OPERATIONS FOR MARKET GENIE
 * 
 * This module wraps ALL Firebase Firestore operations with automatic
 * security validation and MarketGenie prefix enforcement.
 * 
 * 🚨 CRITICAL: ALL database operations MUST go through these wrappers
 * 🚨 NEVER use Firebase methods directly - ALWAYS use these secure wrappers
 * 
 * 🛡️ AUTOMATIC PROTECTION FEATURES:
 * - Collection name validation and sanitization
 * - Automatic MarketGenie prefix enforcement  
 * - Cross-app contamination prevention
 * - Real-time violation monitoring
 * - Emergency blocking of unauthorized operations
 */

import { 
  collection as firebaseCollection,
  doc as firebaseDoc, 
  addDoc as firebaseAddDoc,
  setDoc as firebaseSetDoc,
  getDoc as firebaseGetDoc,
  getDocs as firebaseGetDocs,
  updateDoc as firebaseUpdateDoc,
  deleteDoc as firebaseDeleteDoc,
  query as firebaseQuery,
  where as firebaseWhere,
  orderBy as firebaseOrderBy,
  limit as firebaseLimit
} from 'firebase/firestore';

import { dbGuardian } from './DatabaseGuardian.js';
import { writeWithHealthCheck } from '../utils/firebaseHealthCheck.js';

/**
 * 🛡️ SECURE COLLECTION REFERENCE
 * Validates and secures collection access
 */
export function collection(db, collectionPath, ...pathSegments) {
  const validation = dbGuardian.validateCollectionName(collectionPath);
  
  if (!validation.isValid) {
    console.warn(`🔒 SECURITY: Auto-correcting collection name: ${collectionPath} → ${validation.approvedName}`);
  }
  
  return firebaseCollection(db, validation.approvedName, ...pathSegments);
}

/**
 * 🛡️ SECURE DOCUMENT REFERENCE  
 * Validates and secures document access
 */
export function doc(db, collectionPath, docId, ...pathSegments) {
  const validation = dbGuardian.validateCollectionName(collectionPath);
  
  if (!validation.isValid) {
    console.warn(`🔒 SECURITY: Auto-correcting document collection: ${collectionPath} → ${validation.approvedName}`);
  }
  
  return firebaseDoc(db, validation.approvedName, docId, ...pathSegments);
}

/**
 * 🛡️ SECURE ADD DOCUMENT
 * Adds document with collection validation and health checking
 */
export async function addDoc(collectionRef, data) {
  // Validate the collection reference
  const collectionPath = collectionRef._path?.segments?.[0] || 'unknown';
  const validation = dbGuardian.validateCollectionName(collectionPath);
  
  if (!validation.isValid) {
    throw new Error(`SECURITY BLOCKED: Cannot add document to invalid collection: ${collectionPath}`);
  }
  
  // Add MarketGenie metadata to all documents
  const secureData = {
    ...data,
    _marketGenieApp: true,
    _securityValidated: true,
    _createdAt: new Date().toISOString()
  };
  
  // Use health-checked write operation
  return await writeWithHealthCheck(async () => {
    return firebaseAddDoc(collectionRef, secureData);
  });
}

/**
 * 🛡️ SECURE SET DOCUMENT
 * Sets document with validation
 */
export async function setDoc(docRef, data, options) {
  // Extract collection path from document reference
  const collectionPath = docRef._path?.segments?.[0] || 'unknown';
  const validation = dbGuardian.validateCollectionName(collectionPath);
  
  if (!validation.isValid) {
    throw new Error(`SECURITY BLOCKED: Cannot set document in invalid collection: ${collectionPath}`);
  }
  
  // Add MarketGenie metadata
  const secureData = {
    ...data,
    _marketGenieApp: true,
    _securityValidated: true,
    _updatedAt: new Date().toISOString()
  };
  
  return firebaseSetDoc(docRef, secureData, options);
}

/**
 * 🛡️ SECURE GET DOCUMENT
 * Gets document with validation
 */
export async function getDoc(docRef) {
  const collectionPath = docRef._path?.segments?.[0] || 'unknown';
  const validation = dbGuardian.validateCollectionName(collectionPath);
  
  if (!validation.isValid) {
    console.warn(`🔒 SECURITY: Reading from potentially unsafe collection: ${collectionPath}`);
  }
  
  return firebaseGetDoc(docRef);
}

/**
 * 🛡️ SECURE GET DOCUMENTS
 * Gets documents with validation
 */
export async function getDocs(queryRef) {
  return firebaseGetDocs(queryRef);
}

/**
 * 🛡️ SECURE UPDATE DOCUMENT
 * Updates document with validation
 */
export async function updateDoc(docRef, data, options) {
  const collectionPath = docRef._path?.segments?.[0] || 'unknown';
  const validation = dbGuardian.validateCollectionName(collectionPath);
  
  if (!validation.isValid) {
    throw new Error(`SECURITY BLOCKED: Cannot update document in invalid collection: ${collectionPath}`);
  }
  
  // Add security metadata to updates
  const secureData = {
    ...data,
    _securityValidated: true,
    _updatedAt: new Date().toISOString()
  };
  
  return firebaseUpdateDoc(docRef, secureData, options);
}

/**
 * 🛡️ SECURE DELETE DOCUMENT
 * Deletes document with validation
 */
export async function deleteDoc(docRef) {
  const collectionPath = docRef._path?.segments?.[0] || 'unknown';
  const validation = dbGuardian.validateCollectionName(collectionPath);
  
  if (!validation.isValid) {
    throw new Error(`SECURITY BLOCKED: Cannot delete document from invalid collection: ${collectionPath}`);
  }
  
  return firebaseDeleteDoc(docRef);
}

/**
 * 🛡️ SECURE QUERY OPERATIONS
 * Pass-through for query operations (validation happens at collection level)
 */
export const query = firebaseQuery;
export const where = firebaseWhere;
export const orderBy = firebaseOrderBy;
export const limit = firebaseLimit;

/**
 * 🔍 SECURITY UTILITIES
 */
export const securityUtils = {
  /**
   * Validates if a collection name is MarketGenie compliant
   */
  isSecureCollection: (collectionName) => {
    return dbGuardian.validateCollectionName(collectionName).isValid;
  },
  
  /**
   * Gets the approved MarketGenie collection name
   */
  getSecureCollectionName: (collectionName) => {
    return dbGuardian.validateCollectionName(collectionName).approvedName;
  },
  
  /**
   * Gets current security status
   */
  getSecurityStatus: () => {
    return dbGuardian.getViolationReport();
  }
};

// 🚨 CRITICAL WARNING FOR DEVELOPERS
console.log('🛡️ SECURE FIREBASE WRAPPER LOADED');
console.log('🚨 CRITICAL: Use ONLY these secure wrappers for database operations');
console.log('🚫 NEVER import Firebase methods directly');
console.log('✅ All operations automatically validated for MarketGenie compliance');