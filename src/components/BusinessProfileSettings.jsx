import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTenant } from '../contexts/TenantContext';
import FirebaseUserDataService from '../services/firebaseUserData';
import toast from 'react-hot-toast';

const BusinessProfileSettings = ({ onSave }) => {
  const { tenant } = useTenant();
  const [businessInfo, setBusinessInfo] = useState({
    companyName: '',
    address: '',
    phone: '',
    website: '',
    email: '',
    privacyPolicyUrl: ''
  });
  
  const [senderInfo, setSenderInfo] = useState({
    senderName: '',
    senderTitle: '',
    companyName: '',
    email: '',
    phone: '',
    website: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      loadBusinessProfile();
    }
  }, [tenant?.id]);

  const loadBusinessProfile = async () => {
    try {
      setLoading(true);
      
      // Try to load existing business profile
      const profile = await FirebaseUserDataService.getBusinessProfile(tenant.id);
      
      if (profile) {
        setBusinessInfo(profile.businessInfo || businessInfo);
        setSenderInfo(profile.senderInfo || senderInfo);
      }
    } catch (error) {
      console.error('Error loading business profile:', error);
      // Don't show error toast here - it's fine if no profile exists yet
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessProfile = async () => {
    try {
      setSaving(true);
      
      const profile = {
        businessInfo,
        senderInfo,
        updatedAt: new Date().toISOString()
      };

      await FirebaseUserDataService.saveBusinessProfile(tenant.id, profile);
      toast.success('Business profile saved successfully!');
      
      // Call the onSave callback to update parent component
      if (onSave) {
        onSave();
      }
      
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast.error('Failed to save business profile');
    } finally {
      setSaving(false);
    }
  };

  const updateBusinessInfo = (field, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSenderInfo = (field, value) => {
    if (field.includes('.')) {
      // Handle nested fields like socialLinks.linkedin
      const [parent, child] = field.split('.');
      setSenderInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSenderInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-genie-teal"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
          <p className="text-gray-600">Configure your business information for email footers and signatures</p>
        </div>
        <button
          onClick={saveBusinessProfile}
          disabled={saving}
          className="bg-genie-teal text-white px-6 py-2 rounded-lg hover:bg-genie-teal/80 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Business Information Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
        <p className="text-sm text-gray-600 mb-6">This information will appear in your email footers</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={businessInfo.companyName}
              onChange={(e) => updateBusinessInfo('companyName', e.target.value)}
              placeholder="Your Company Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Email
            </label>
            <input
              type="email"
              value={businessInfo.email}
              onChange={(e) => updateBusinessInfo('email', e.target.value)}
              placeholder="contact@yourcompany.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <input
              type="text"
              value={businessInfo.address}
              onChange={(e) => updateBusinessInfo('address', e.target.value)}
              placeholder="123 Business St, City, State 12345"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={businessInfo.phone}
              onChange={(e) => updateBusinessInfo('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="text"
              value={businessInfo.website}
              onChange={(e) => updateBusinessInfo('website', e.target.value)}
              placeholder="www.yourcompany.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Policy URL
            </label>
            <input
              type="url"
              value={businessInfo.privacyPolicyUrl}
              onChange={(e) => updateBusinessInfo('privacyPolicyUrl', e.target.value)}
              placeholder="https://yourcompany.com/privacy"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Email Signature Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Signature</h3>
        <p className="text-sm text-gray-600 mb-6">This information will appear as a signature in your emails</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={senderInfo.senderName}
              onChange={(e) => updateSenderInfo('senderName', e.target.value)}
              placeholder="John Smith"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Title
            </label>
            <input
              type="text"
              value={senderInfo.senderTitle}
              onChange={(e) => updateSenderInfo('senderTitle', e.target.value)}
              placeholder="Marketing Director"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email
            </label>
            <input
              type="email"
              value={senderInfo.email}
              onChange={(e) => updateSenderInfo('email', e.target.value)}
              placeholder="john@yourcompany.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Direct Phone
            </label>
            <input
              type="tel"
              value={senderInfo.phone}
              onChange={(e) => updateSenderInfo('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <h4 className="text-md font-medium text-gray-900 mb-3">Social Media Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={senderInfo.socialLinks.linkedin}
                  onChange={(e) => updateSenderInfo('socialLinks.linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={senderInfo.socialLinks.twitter}
                  onChange={(e) => updateSenderInfo('socialLinks.twitter', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={senderInfo.socialLinks.facebook}
                  onChange={(e) => updateSenderInfo('socialLinks.facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Footer Preview</h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div 
            dangerouslySetInnerHTML={{
              __html: `
                <div style="margin-top: 30px; margin-bottom: 20px; padding: 20px; border-left: 4px solid #14b8a6; background-color: #f0fdfa; font-family: Arial, sans-serif;">
                  <p style="margin: 5px 0; font-weight: bold; font-size: 16px; color: #374151;">${senderInfo.senderName || 'Your Name'}</p>
                  <p style="margin: 5px 0; color: #6b7280; font-style: italic;">${senderInfo.senderTitle || 'Your Title'}</p>
                  <p style="margin: 5px 0; font-weight: bold; color: #14b8a6;">${businessInfo.companyName || 'Your Company'}</p>
                  
                  <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
                    <p style="margin: 3px 0;">📧 ${senderInfo.email || 'your@email.com'}</p>
                    ${senderInfo.phone ? `<p style="margin: 3px 0;">📞 ${senderInfo.phone}</p>` : ''}
                    ${businessInfo.website ? `<p style="margin: 3px 0;">🌐 ${businessInfo.website}</p>` : ''}
                  </div>
                </div>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; font-family: Arial, sans-serif;">
                  <div style="margin-bottom: 15px;">
                    <p style="margin: 5px 0; font-weight: bold; color: #374151;">${businessInfo.companyName || 'Your Business Name'}</p>
                    <p style="margin: 5px 0;">${businessInfo.address || 'Your Business Address'}</p>
                    ${businessInfo.phone ? `<p style="margin: 5px 0;">Phone: ${businessInfo.phone}</p>` : ''}
                    ${businessInfo.website ? `<p style="margin: 5px 0;">Website: ${businessInfo.website}</p>` : ''}
                  </div>
                  
                  <div style="margin: 15px 0; padding: 10px; background-color: #f9fafb; border-radius: 5px;">
                    <p style="margin: 5px 0;">
                      <a href="#" style="color: #dc2626; text-decoration: underline; font-weight: bold;">Unsubscribe from these emails</a>
                      ${businessInfo.privacyPolicyUrl ? ` | <a href="${businessInfo.privacyPolicyUrl}" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>` : ''}
                    </p>
                  </div>
                  
                  <p style="margin: 10px 0; font-size: 10px; color: #9ca3af;">
                    © ${new Date().getFullYear()} ${businessInfo.companyName || 'Your Business Name'}. All rights reserved.<br>
                    You received this email because you opted in to our communications.
                  </p>
                </div>
              `
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessProfileSettings;