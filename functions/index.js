const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Create transporter with user's SMTP credentials
const createTransporter = (smtpConfig) => {
  return nodemailer.createTransporter({
    host: smtpConfig.smtpHost || 'smtp.zoho.com',
    port: parseInt(smtpConfig.smtpPort) || 587,
    secure: (smtpConfig.smtpPort === '465'), // true for 465, false for other ports
    auth: {
      user: smtpConfig.smtpEmail,
      pass: smtpConfig.smtpPassword
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email sending function
exports.sendCampaignEmail = functions.https.onCall(async (data, context) => {
  try {
    console.log('Function called with data keys:', Object.keys(data || {}));
    
    // Validate input
    if (!data || !data.to || !data.subject || !data.content || !data.tenantId) {
      console.log('Validation failed:', {
        hasData: !!data,
        hasTo: !!(data && data.to),
        hasSubject: !!(data && data.subject), 
        hasContent: !!(data && data.content),
        hasTenantId: !!(data && data.tenantId)
      });
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: to, subject, content, tenantId');
    }

    // Fetch user's SMTP credentials from database
    const credentialsDoc = await db
      .collection('integrations')
      .doc(data.tenantId)
      .collection('credentials')
      .doc('zoho_mail_smtp')
      .get();

    if (!credentialsDoc.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'SMTP credentials not configured. Please configure email settings in integrations.');
    }

    const smtpConfig = credentialsDoc.data();
    
    // Validate SMTP credentials
    if (!smtpConfig.smtpEmail || !smtpConfig.smtpPassword) {
      throw new functions.https.HttpsError('failed-precondition', 'Incomplete SMTP configuration. Please check email settings.');
    }

    // Create transporter with user's credentials
    const transporter = createTransporter(smtpConfig);

    // Email options using user's credentials
    const fromName = smtpConfig.smtpFromName || 'Marketing Campaign';
    const mailOptions = {
      from: `"${fromName}" <${smtpConfig.smtpEmail}>`,
      to: data.to,
      subject: data.subject,
      html: data.content,
      text: data.content.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      from: mailOptions.from,
      to: data.to,
      subject: data.subject
    };

  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email: ' + error.message);
  }
});

// Example HTTP function
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase Functions!');
});
