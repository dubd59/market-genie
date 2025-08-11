// Email campaign automation service
import { Databases } from 'node-appwrite';
import nodemailer from 'nodemailer';

export class EmailCampaignService {
  constructor(appwriteClient, userId) {
    this.db = new Databases(appwriteClient);
    this.userId = userId;
    // Configure nodemailer (replace with SendGrid/Twilio for production)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendCampaignEmail(lead, template, variables) {
    // Render template (simple string replace for now)
    let content = template;
    for (const key in variables) {
      content = content.replace(`{{${key}}}`, variables[key]);
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: lead.email,
      subject: `MarketGenie Campaign: ${variables.subject || 'Outreach'}`,
      html: content
    };
    await this.transporter.sendMail(mailOptions);
    await this.db.createDocument(
      'marketGenie_campaigns',
      'outbound_emails',
      'unique()',
      {
        leadId: lead.id,
        template,
        sentAt: new Date().toISOString(),
        status: 'sent'
      }
    );
  }

  async scheduleCampaignEmail(lead, template, variables, sendDate) {
    // Save scheduled email to DB
    await this.db.createDocument(
      'marketGenie_campaigns',
      'scheduled_emails',
      'unique()',
      {
        leadId: lead.id,
        template,
        variables,
        sendDate,
        status: 'scheduled'
      }
    );
  }

  async trackEmailOpen(leadId, emailId) {
    // Track open event
    await this.db.updateDocument(
      'marketGenie_campaigns',
      'outbound_emails',
      emailId,
      { openedAt: new Date().toISOString(), status: 'opened' }
    );
  }
}
