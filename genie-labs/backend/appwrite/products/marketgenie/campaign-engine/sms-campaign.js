// SMS campaign automation service
import { Databases } from 'node-appwrite';
import twilio from 'twilio';

export class SMSCampaignService {
  constructor(appwriteClient, userId) {
    this.db = new Databases(appwriteClient);
    this.userId = userId;
    this.twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    this.twilioNumber = process.env.TWILIO_NUMBER;
  }

  async sendCampaignSMS(lead, message) {
    if (!lead.phone) return;
    await this.twilioClient.messages.create({
      body: message,
      from: this.twilioNumber,
      to: lead.phone
    });
    await this.db.createDocument(
      'marketGenie_campaigns',
      'outbound_sms',
      'unique()',
      {
        leadId: lead.id,
        message,
        sentAt: new Date().toISOString(),
        status: 'sent'
      }
    );
  }

  async scheduleCampaignSMS(lead, message, sendDate) {
    await this.db.createDocument(
      'marketGenie_campaigns',
      'scheduled_sms',
      'unique()',
      {
        leadId: lead.id,
        message,
        sendDate,
        status: 'scheduled'
      }
    );
  }
}
