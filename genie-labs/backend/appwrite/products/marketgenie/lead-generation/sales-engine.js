// Automated lead generation and sales pipeline
import { Databases, Query } from 'node-appwrite';
import { WebLeadScraper } from './web-scraper.js';
import { LeadImportService } from './lead-import.js';
import { EmailCampaignService } from '../campaign-engine/email-campaign.js';
import { SMSCampaignService } from '../campaign-engine/sms-campaign.js';
import { SocialCampaignService } from '../campaign-engine/social-campaign.js';
import { CRMService } from '../crm-service.js';
import { FunnelBuilderService } from '../funnel-builder.js';
import { AppointmentService } from '../appointment-service.js';

export class AutomatedSalesEngine {
  constructor(appwriteClient, userId) {
    this.db = new Databases(appwriteClient);
    this.scraper = new WebLeadScraper(appwriteClient, userId);
    this.importer = new LeadImportService(appwriteClient, userId);
    this.emailCampaign = new EmailCampaignService(appwriteClient, userId);
    this.smsCampaign = new SMSCampaignService(appwriteClient, userId);
    this.socialCampaign = new SocialCampaignService(appwriteClient, userId);
    this.crm = new CRMService(appwriteClient, userId);
    this.funnelBuilder = new FunnelBuilderService(appwriteClient, userId);
    this.appointmentService = new AppointmentService(appwriteClient, userId);
    this.userId = userId;
  }

  // Appointment Booking & Reminders
  async createBooking(lead, calendarType = 'google') {
    return await this.appointmentService.createBooking(lead, calendarType);
  }
  async sendBookingReminder(lead, bookingLink, message, sendTime) {
    return await this.appointmentService.sendBookingReminder(lead, bookingLink, message, sendTime);
  }
  async getAppointments(userId) {
    return await this.appointmentService.getAppointments(userId);
  }

  // CRM & Pipeline Management
  async addContactToCRM(contact) {
    return await this.crm.addContact(contact);
  }
  async addNoteToContact(contactId, note) {
    return await this.crm.addNote(contactId, note);
  }
  async addActivityToContact(contactId, activity) {
    return await this.crm.addActivity(contactId, activity);
  }
  async getContactTimeline(contactId) {
    return await this.crm.getTimeline(contactId);
  }
  async addContactToPipeline(contactId, stage) {
    return await this.crm.addToPipeline(contactId, stage);
  }
  async updatePipelineStage(contactId, stage) {
    return await this.crm.updatePipelineStage(contactId, stage);
  }
  async scoreLead(contactId, score) {
    return await this.crm.scoreLead(contactId, score);
  }
  async assignLead(contactId, userId) {
    return await this.crm.assignLead(contactId, userId);
  }
  async setContactPermissions(contactId, permissions) {
    return await this.crm.setPermissions(contactId, permissions);
  }

  // Funnel Builder
  async createFunnel(name, stages) {
    return await this.funnelBuilder.createFunnel(name, stages);
  }
  async updateFunnel(funnelId, stages) {
    return await this.funnelBuilder.updateFunnel(funnelId, stages);
  }
  async getFunnels() {
    return await this.funnelBuilder.getFunnels();
  }
  async dragAndDropFunnelStage(funnelId, fromIndex, toIndex) {
    return await this.funnelBuilder.dragAndDropStage(funnelId, fromIndex, toIndex);
  }
}
