// Appointment Booking & Reminders Service
import { Databases } from 'node-appwrite';

export class AppointmentService {
  constructor(appwriteClient, userId) {
    this.db = new Databases(appwriteClient);
    this.userId = userId;
  }

  async createBooking(lead, calendarType = 'google') {
    // Generate booking link (Google/Outlook/Calendly)
    let bookingLink = '';
    if (calendarType === 'google') {
      bookingLink = `https://calendar.google.com/calendar/r/eventedit?text=Consultation+with+${lead.name}`;
    } else if (calendarType === 'outlook') {
      bookingLink = `https://outlook.live.com/calendar/0/deeplink/compose?subject=Consultation+with+${lead.name}`;
    } else {
      bookingLink = `https://calendly.com/marketgenie/consultation?lead=${lead.id}`;
    }
    await this.db.createDocument(
      'marketGenie_crm',
      'appointments',
      'unique()',
      {
        leadId: lead.id,
        bookingLink,
        createdAt: new Date().toISOString(),
        status: 'pending',
        calendarType
      }
    );
    return bookingLink;
  }

  async sendBookingReminder(lead, bookingLink, message, sendTime) {
    await this.db.createDocument(
      'marketGenie_crm',
      'appointment_reminders',
      'unique()',
      {
        leadId: lead.id,
        bookingLink,
        message,
        sendTime,
        status: 'scheduled'
      }
    );
  }

  async getAppointments(userId) {
    return await this.db.listDocuments('marketGenie_crm', 'appointments', [userId ? { userId } : {}]);
  }
}
