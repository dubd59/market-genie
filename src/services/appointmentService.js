import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Appointment Service - Manages appointment data in Firebase
 */
class AppointmentService {
  constructor() {
    this.collectionName = 'appointments';
  }

  // Get appointments collection reference for a tenant
  getAppointmentsRef(tenantId) {
    return collection(db, 'tenants', tenantId, this.collectionName);
  }

  // Add a new appointment
  async addAppointment(tenantId, appointmentData) {
    try {
      const appointmentsRef = this.getAppointmentsRef(tenantId);
      const docRef = await addDoc(appointmentsRef, {
        ...appointmentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Appointment created:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      return { success: false, error: error.message };
    }
  }

  // Update an appointment
  async updateAppointment(tenantId, appointmentId, updates) {
    try {
      const appointmentRef = doc(db, 'tenants', tenantId, this.collectionName, appointmentId);
      await updateDoc(appointmentRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Appointment updated:', appointmentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete an appointment
  async deleteAppointment(tenantId, appointmentId) {
    try {
      const appointmentRef = doc(db, 'tenants', tenantId, this.collectionName, appointmentId);
      await deleteDoc(appointmentRef);
      console.log('✅ Appointment deleted:', appointmentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all appointments for a tenant
  async getAppointments(tenantId) {
    try {
      const appointmentsRef = this.getAppointmentsRef(tenantId);
      const q = query(appointmentsRef, orderBy('appointmentDate', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('✅ Appointments loaded:', appointments.length);
      return { success: true, data: appointments };
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate appointment statistics
  calculateAppointmentStats(appointments) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let upcoming = 0;
    let booked = 0;
    let cancelled = 0;
    
    appointments.forEach(appointment => {
      const appointmentDate = appointment.appointmentDate?.toDate ? 
        appointment.appointmentDate.toDate() : 
        new Date(appointment.appointmentDate);
      
      // Count based on status and date
      if (appointment.status === 'cancelled') {
        cancelled++;
      } else if (appointment.status === 'confirmed' || appointment.status === 'booked') {
        booked++;
        // If it's in the future, also count as upcoming
        if (appointmentDate >= today) {
          upcoming++;
        }
      } else if (appointment.status === 'pending' && appointmentDate >= today) {
        upcoming++;
      }
    });
    
    return {
      upcoming,
      booked,
      cancelled,
      total: appointments.length
    };
  }

  // Listen to appointment changes in real-time
  subscribeToAppointments(tenantId, callback) {
    const appointmentsRef = this.getAppointmentsRef(tenantId);
    const q = query(appointmentsRef, orderBy('appointmentDate', 'asc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('🔄 Appointments updated:', appointments.length);
      callback(appointments);
    }, (error) => {
      console.error('❌ Error in appointments subscription:', error);
      callback([]);
    });
  }

  // Add sample appointment data for testing
  async addSampleAppointments(tenantId) {
    const sampleAppointments = [
      {
        title: 'Sales Demo with TechCorp',
        clientName: 'John Smith',
        clientEmail: 'john@techcorp.com',
        appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
        duration: 60, // minutes
        status: 'confirmed',
        notes: 'Demo of our new CRM features'
      },
      {
        title: 'Strategy Session',
        clientName: 'Sarah Johnson',
        clientEmail: 'sarah@startup.com',
        appointmentDate: new Date(Date.now() + 172800000), // Day after tomorrow
        duration: 45,
        status: 'booked',
        notes: 'Discuss marketing automation setup'
      },
      {
        title: 'Follow-up Call',
        clientName: 'Mike Wilson',
        clientEmail: 'mike@company.com',
        appointmentDate: new Date(Date.now() - 86400000), // Yesterday
        duration: 30,
        status: 'cancelled',
        notes: 'Client cancelled due to scheduling conflict'
      }
    ];

    for (const appointment of sampleAppointments) {
      await this.addAppointment(tenantId, appointment);
    }
    
    console.log('✅ Sample appointments added');
    return { success: true };
  }
}

export default new AppointmentService();