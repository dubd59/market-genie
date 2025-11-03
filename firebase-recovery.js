/**
 * FIREBASE CONNECTIVITY RECOVERY TOOL
 * Attempts to fix WebChannel transport errors and restore Firebase connection
 */

class FirebaseRecoveryTool {
    constructor() {
        this.recoveryAttempts = 0;
        this.maxRecoveryAttempts = 5;
        this.isRecovering = false;
        
        console.log('🔧 Firebase Recovery Tool initialized');
        this.startRecoveryMonitor();
    }

    // Start automatic recovery monitoring
    startRecoveryMonitor() {
        console.log('👁️ Starting Firebase connection monitor...');
        
        // Check connection every 30 seconds
        setInterval(() => {
            this.checkAndRecover();
        }, 30000);

        // Initial check
        setTimeout(() => this.checkAndRecover(), 5000);
    }

    // Check connection and attempt recovery if needed
    async checkAndRecover() {
        if (this.isRecovering) {
            console.log('🔄 Recovery already in progress...');
            return;
        }

        const isConnected = await this.testFirebaseConnection();
        
        if (!isConnected) {
            console.log('🚨 Firebase connection issue detected, starting recovery...');
            await this.attemptRecovery();
        } else {
            console.log('✅ Firebase connection healthy');
            this.recoveryAttempts = 0; // Reset counter on successful connection
            
            // Attempt to sync any offline leads
            if (window.emergencyLeadStorage) {
                const pendingLeads = window.emergencyLeadStorage.getPendingSync();
                if (pendingLeads.length > 0) {
                    console.log(`🔄 Found ${pendingLeads.length} leads to sync...`);
                    await window.emergencyLeadStorage.syncWithFirebase();
                }
            }
        }
    }

    // Test Firebase connection
    async testFirebaseConnection() {
        try {
            // Try to access Firestore
            if (window.db) {
                const testQuery = await window.db.collection('test').limit(1).get();
                return true;
            }
            
            // Alternative test using global Firebase
            if (window.firebase && window.firebase.firestore) {
                const db = window.firebase.firestore();
                await db.collection('test').limit(1).get();
                return true;
            }

            console.log('❌ Firebase instance not available');
            return false;
        } catch (error) {
            console.log('❌ Firebase connection test failed:', error.message);
            return false;
        }
    }

    // Attempt to recover Firebase connection
    async attemptRecovery() {
        if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
            console.log('❌ Max recovery attempts reached. Manual intervention required.');
            return false;
        }

        this.isRecovering = true;
        this.recoveryAttempts++;
        
        console.log(`🔧 Recovery attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts}`);

        try {
            // Method 1: Force Firestore cache clear and reconnect
            await this.clearFirestoreCache();
            
            // Method 2: Reinitialize Firebase connection
            await this.reinitializeFirebase();
            
            // Method 3: Clear browser network cache
            await this.clearNetworkCache();
            
            // Wait a bit for connection to stabilize
            await this.delay(5000);
            
            // Test connection again
            const isRecovered = await this.testFirebaseConnection();
            
            if (isRecovered) {
                console.log('✅ Firebase connection recovered!');
                this.recoveryAttempts = 0;
                this.isRecovering = false;
                
                // Notify user
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Firebase connection restored! 🎉', 'success');
                }
                
                return true;
            } else {
                console.log(`❌ Recovery attempt ${this.recoveryAttempts} failed`);
                this.isRecovering = false;
                return false;
            }
            
        } catch (error) {
            console.error('❌ Recovery error:', error);
            this.isRecovering = false;
            return false;
        }
    }

    // Clear Firestore cache
    async clearFirestoreCache() {
        try {
            console.log('🧹 Clearing Firestore cache...');
            
            if (window.db && window.db.clearPersistence) {
                await window.db.clearPersistence();
                console.log('✅ Firestore cache cleared');
            }
            
            // Alternative method
            if (window.firebase && window.firebase.firestore) {
                const db = window.firebase.firestore();
                if (db.clearPersistence) {
                    await db.clearPersistence();
                    console.log('✅ Alternative Firestore cache cleared');
                }
            }
        } catch (error) {
            console.log('⚠️ Cache clear failed (expected if app is active):', error.message);
        }
    }

    // Reinitialize Firebase connection
    async reinitializeFirebase() {
        try {
            console.log('🔄 Reinitializing Firebase connection...');
            
            // Force disconnect and reconnect
            if (window.db && window.db.goOffline && window.db.goOnline) {
                await window.db.goOffline();
                await this.delay(2000);
                await window.db.goOnline();
                console.log('✅ Firebase reconnected');
            }
            
            // Alternative method
            if (window.firebase && window.firebase.firestore) {
                const db = window.firebase.firestore();
                if (db.goOffline && db.goOnline) {
                    await db.goOffline();
                    await this.delay(2000);
                    await db.goOnline();
                    console.log('✅ Alternative Firebase reconnected');
                }
            }
        } catch (error) {
            console.log('⚠️ Firebase reinit failed:', error.message);
        }
    }

    // Clear browser network cache
    async clearNetworkCache() {
        try {
            console.log('🧹 Clearing network cache...');
            
            // Clear service worker cache if available
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('✅ Service worker cache cleared');
            }
            
            // Force refresh network connections
            if (navigator.onLine) {
                // Trigger a small network request to refresh connections
                await fetch('/favicon.ico', { 
                    cache: 'no-cache',
                    mode: 'no-cors'
                }).catch(() => {}); // Ignore errors
            }
            
        } catch (error) {
            console.log('⚠️ Network cache clear failed:', error.message);
        }
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Manual recovery trigger
    async forceRecovery() {
        console.log('🔧 Manual recovery triggered');
        this.recoveryAttempts = 0; // Reset counter for manual trigger
        return await this.attemptRecovery();
    }

    // Get recovery status
    getStatus() {
        return {
            isRecovering: this.isRecovering,
            attempts: this.recoveryAttempts,
            maxAttempts: this.maxRecoveryAttempts,
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize recovery tool
window.firebaseRecovery = new FirebaseRecoveryTool();

// Expose functions for console access
window.fbRecover = {
    status: () => window.firebaseRecovery.getStatus(),
    test: () => window.firebaseRecovery.testFirebaseConnection(),
    recover: () => window.firebaseRecovery.forceRecovery(),
    monitor: () => window.firebaseRecovery.checkAndRecover()
};

console.log('🔧 Firebase Recovery Tool loaded. Use fbRecover.* functions');
console.log('📊 Current status:', window.firebaseRecovery.getStatus());