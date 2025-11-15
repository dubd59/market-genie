// Unsubscribe Management Service
import FirebaseUserDataService from './firebaseUserData';
import { collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

export class UnsubscribeService {
  
  // Generate unique unsubscribe token for email
  static generateUnsubscribeToken(tenantId, email, campaignId = null) {
    const data = {
      tenantId,
      email: typeof email === 'string' ? email.toLowerCase() : String(email || '').toLowerCase(),
      campaignId,
      timestamp: Date.now()
    };
    
    // Create a unique token (in production, use proper encryption)
    const token = btoa(JSON.stringify(data)).replace(/[^a-zA-Z0-9]/g, '');
    return token;
  }

  // Create unsubscribe link for emails
  static createUnsubscribeLink(tenantId, email, campaignId = null) {
    const token = this.generateUnsubscribeToken(tenantId, email, campaignId);
    const baseUrl = 'https://us-central1-market-genie-f2d41.cloudfunctions.net';
    return `${baseUrl}/processUnsubscribe?token=${token}`;
  }

  // Process unsubscribe request
  static async processUnsubscribe(token) {
    try {
      // Decode token to get email and tenant info
      const decodedData = JSON.parse(atob(token));
      const { tenantId, email, campaignId } = decodedData;

      // Record the unsubscribe
      const unsubscribeRecord = {
        email: email.toLowerCase(),
        tenantId,
        campaignId,
        unsubscribedAt: serverTimestamp(),
        method: 'email_link',
        userAgent: navigator.userAgent,
        ipAddress: 'client-side' // In production, get from server
      };

      // Store unsubscribe record
      const unsubscribeRef = doc(collection(db, 'unsubscribes'));
      await setDoc(unsubscribeRef, unsubscribeRecord);

      // Update contact status if it exists
      await this.updateContactUnsubscribeStatus(tenantId, email);

      // Remove from active email lists
      await this.removeFromActiveLists(tenantId, email);

      return {
        success: true,
        email,
        campaignId,
        message: 'Successfully unsubscribed from emails'
      };

    } catch (error) {
      console.error('Unsubscribe processing error:', error);
      throw new Error('Failed to process unsubscribe request');
    }
  }

  // Update contact unsubscribe status
  static async updateContactUnsubscribeStatus(tenantId, email) {
    try {
      // Find contact in leads collection
      const leadsRef = collection(db, 'leads');
      const q = query(
        leadsRef, 
        where('tenantId', '==', tenantId),
        where('email', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      // Update all matching contacts
      const updatePromises = querySnapshot.docs.map(doc => {
        return updateDoc(doc.ref, {
          unsubscribed: true,
          unsubscribedAt: serverTimestamp(),
          emailStatus: 'unsubscribed'
        });
      });

      await Promise.all(updatePromises);
      
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  }

  // Remove from active email lists
  static async removeFromActiveLists(tenantId, email) {
    try {
      // Get all email campaigns for this tenant
      const campaignsRef = collection(db, 'emailCampaigns');
      const q = query(campaignsRef, where('tenantId', '==', tenantId));
      const campaignsSnapshot = await getDocs(q);

      // Remove email from recipient lists
      const updatePromises = campaignsSnapshot.docs.map(async (doc) => {
        const campaignData = doc.data();
        if (campaignData.recipients && campaignData.recipients.includes(email.toLowerCase())) {
          const updatedRecipients = campaignData.recipients.filter(
            recipient => recipient !== email.toLowerCase()
          );
          
          return updateDoc(doc.ref, {
            recipients: updatedRecipients,
            unsubscribedEmails: [...(campaignData.unsubscribedEmails || []), email.toLowerCase()]
          });
        }
      });

      await Promise.all(updatePromises.filter(Boolean));
      
    } catch (error) {
      console.error('Error removing from active lists:', error);
    }
  }

  // Check if email is unsubscribed
  static async isUnsubscribed(tenantId, email) {
    try {
      const unsubscribesRef = collection(db, 'unsubscribes');
      const q = query(
        unsubscribesRef,
        where('tenantId', '==', tenantId),
        where('email', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
      
    } catch (error) {
      console.error('Error checking unsubscribe status:', error);
      return false;
    }
  }

  // Get unsubscribe statistics for tenant
  static async getUnsubscribeStats(tenantId) {
    try {
      const unsubscribesRef = collection(db, 'unsubscribes');
      const q = query(unsubscribesRef, where('tenantId', '==', tenantId));
      const querySnapshot = await getDocs(q);

      const stats = {
        totalUnsubscribes: querySnapshot.size,
        unsubscribesByMonth: {},
        unsubscribesByReason: {},
        recentUnsubscribes: []
      };

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.unsubscribedAt?.toDate();
        
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          stats.unsubscribesByMonth[monthKey] = (stats.unsubscribesByMonth[monthKey] || 0) + 1;
          
          // Recent unsubscribes (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          if (date > thirtyDaysAgo) {
            stats.recentUnsubscribes.push({
              email: data.email,
              date: date,
              campaignId: data.campaignId
            });
          }
        }
      });

      return stats;
      
    } catch (error) {
      console.error('Error getting unsubscribe stats:', error);
      return { totalUnsubscribes: 0, unsubscribesByMonth: {}, recentUnsubscribes: [] };
    }
  }

  // Resubscribe user (opt them back in)
  static async resubscribe(tenantId, email) {
    try {
      // Remove unsubscribe records
      const unsubscribesRef = collection(db, 'unsubscribes');
      const q = query(
        unsubscribesRef,
        where('tenantId', '==', tenantId),
        where('email', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Update contact status
      const leadsRef = collection(db, 'leads');
      const leadsQuery = query(
        leadsRef,
        where('tenantId', '==', tenantId),
        where('email', '==', email.toLowerCase())
      );
      
      const leadsSnapshot = await getDocs(leadsQuery);
      const updatePromises = leadsSnapshot.docs.map(doc => {
        return updateDoc(doc.ref, {
          unsubscribed: false,
          emailStatus: 'active',
          resubscribedAt: serverTimestamp()
        });
      });

      await Promise.all(updatePromises);

      return { success: true, message: 'Successfully resubscribed to emails' };
      
    } catch (error) {
      console.error('Resubscribe error:', error);
      throw new Error('Failed to resubscribe');
    }
  }

  // Bulk unsubscribe management
  static async bulkUnsubscribe(tenantId, emails, reason = 'bulk_operation') {
    try {
      const results = [];
      
      for (const email of emails) {
        try {
          const token = this.generateUnsubscribeToken(tenantId, email);
          await this.processUnsubscribe(token);
          results.push({ email, success: true });
        } catch (error) {
          results.push({ email, success: false, error: error.message });
        }
      }

      return results;
      
    } catch (error) {
      console.error('Bulk unsubscribe error:', error);
      throw error;
    }
  }

  // Generate unsubscribe footer HTML for emails
  static generateUnsubscribeFooter(tenantId, email, campaignId = null, businessInfo = {}) {
    const unsubscribeUrl = this.createUnsubscribeLink(tenantId, email, campaignId);
    
    // Default business info if not provided
    const {
      companyName = 'Your Business Name',
      address = 'Your Business Address',
      phone = 'Your Phone Number',
      website = 'www.yourbusiness.com',
      privacyPolicyUrl = '#'
    } = businessInfo;
    
    return `
      <div style="margin-top: 20px; padding: 20px; background-color: #f8fafc; border-top: 3px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; font-family: Arial, sans-serif; border-radius: 0 0 8px 8px;">
        <div style="margin-bottom: 15px;">
          <p style="margin: 5px 0; font-weight: bold; color: #374151;">${companyName}</p>
          <p style="margin: 5px 0;">${address}</p>
          ${phone !== 'Your Phone Number' ? `<p style="margin: 5px 0;">Phone: ${phone}</p>` : ''}
          ${website !== 'www.yourbusiness.com' ? `<p style="margin: 5px 0;">Website: <a href="https://${website}" style="color: #14b8a6; text-decoration: none;">${website}</a></p>` : ''}
        </div>
        
        <div style="margin: 15px 0; padding: 10px; background-color: #f9fafb; border-radius: 5px;">
          <p style="margin: 5px 0;">
            <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: underline; font-weight: bold;">Unsubscribe from these emails</a>
            ${privacyPolicyUrl !== '#' ? ` | <a href="${privacyPolicyUrl}" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>` : ''}
          </p>
        </div>
        
        <p style="margin: 10px 0; font-size: 10px; color: #9ca3af;">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.<br>
          You received this email because you opted in to our communications.
        </p>
        
        <p style="margin: 5px 0; font-size: 10px; color: #d1d5db;">
          Powered by <a href="https://marketgenie.tech" style="color: #14b8a6; text-decoration: none;">MarketGenie</a> - AI Marketing Platform
        </p>
      </div>
    `;
  }

  // Generate email signature (separate from footer)
  static generateEmailSignature(senderInfo = {}) {
    const {
      senderName = 'Your Name',
      senderTitle = 'Your Title',
      companyName = 'Your Company',
      email = 'your@email.com',
      phone = '',
      website = '',
      socialLinks = {}
    } = senderInfo;

    return `
      <div style="margin-top: 20px; margin-bottom: 20px; padding: 20px; border-left: 4px solid #14b8a6; background-color: #f0fdfa; font-family: Arial, sans-serif; border-radius: 8px;">
        <p style="margin: 5px 0; font-weight: bold; font-size: 16px; color: #374151;">${senderName}</p>
        <p style="margin: 5px 0; color: #6b7280; font-style: italic;">${senderTitle}</p>
        <p style="margin: 5px 0; font-weight: bold; color: #14b8a6;">${companyName}</p>
        
        <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
          <p style="margin: 3px 0;">📧 <a href="mailto:${email}" style="color: #14b8a6; text-decoration: none;">${email}</a></p>
          ${phone ? `<p style="margin: 3px 0;">📞 ${phone}</p>` : ''}
          ${website ? `<p style="margin: 3px 0;">🌐 <a href="https://${website}" style="color: #14b8a6; text-decoration: none;">${website}</a></p>` : ''}
          
          ${Object.keys(socialLinks).length > 0 ? `
            <div style="margin-top: 8px;">
              ${socialLinks.linkedin ? `<a href="${socialLinks.linkedin}" style="color: #0077b5; text-decoration: none; margin-right: 10px;">LinkedIn</a>` : ''}
              ${socialLinks.twitter ? `<a href="${socialLinks.twitter}" style="color: #1da1f2; text-decoration: none; margin-right: 10px;">Twitter</a>` : ''}
              ${socialLinks.facebook ? `<a href="${socialLinks.facebook}" style="color: #4267b2; text-decoration: none;">Facebook</a>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

export default UnsubscribeService;