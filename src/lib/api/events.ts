import { apiClient } from './client';
import { Event, EventFormData, EventRegistration } from '@/types/api';
import { FileUploadResult } from '@/lib/utils/file-upload';

export const eventsApi = {
  // Get all events
  async getEvents(): Promise<Event[]> {
    return apiClient.get('/event/');
  },

  // Get event by ID
  async getEvent(eventId: number): Promise<Event> {
    return apiClient.get(`/event/${eventId}/`);
  },

  // Create new event
  async createEvent(data: EventFormData): Promise<Event> {
    return apiClient.post('/event/', data);
  },

  // Update event
  async updateEvent(eventId: number, data: Partial<EventFormData>): Promise<Event> {
    return apiClient.patch(`/event/${eventId}/`, data);
  },

  // Delete event
  async deleteEvent(eventId: number): Promise<void> {
    return apiClient.delete(`/event/${eventId}/`);
  },

  // Register for event
  async registerForEvent(eventId: number, data: EventRegistration): Promise<void> {
    return apiClient.post(`/event/${eventId}/registration/`, data);
  },

  // Get my events (created by user)
  async getMyEvents(): Promise<Event[]> {
    return apiClient.get('/event/myevent/');
  },

  // Get my registered events
  async getMyRegisteredEvents(): Promise<Event[]> {
    return apiClient.get('/event/my-registered-event/');
  },

  // Get event QR code
  async getEventQRCode(eventId: number): Promise<{ qr_code: string }> {
    const response = await apiClient.get(`/event/${eventId}/qrcode/`) as { qr_url: string };
    // Backend returns qr_url, but frontend expects qr_code
    return {
      qr_code: response.qr_url
    };
  },

  // Get event registrants
  async getEventRegistrants(eventId: number): Promise<any[]> {
    return apiClient.get(`/event/${eventId}/register-list/`);
  },

  // Export event registrants
  async exportEventRegistrants(eventId: number): Promise<void> {
    return apiClient.post(`/event/${eventId}/export-registrant/`);
  },

  // Download event certificate
  async downloadEventCertificate(eventId: number): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/event/${eventId}/download-certificate/`, {
      headers: {
        Authorization: `Token ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download certificate');
    }

    return response.blob();
  },

  // Mark event attendance (for QR scanning)
  async markAttendance(eventNonce: string, nonce: string): Promise<void> {
    return apiClient.post(`/event/attend/${eventNonce}/participant/`, { nonce });
  },

  // Upload event media
  async uploadEventMedia(eventId: number, fileIds: number[]): Promise<void> {
    return apiClient.post(`/event/${eventId}/upload-media/`, { media_id: fileIds });
  },

  // Upload main image untuk event
  async uploadMainImage(file: File, caption?: string): Promise<FileUploadResult> {
    const uploaded = await (await import('./blog')).blogApi.uploadBlogImage(file, caption);
    return {
      success: true,
      data: {
        file_id: String(uploaded.pk),
        filename: uploaded.display_name,
        file_type: 'image',
        file_size: 0,
        url: uploaded.image,
        created_at: new Date().toISOString(),
      },
    };
  },

  // Set surveys for event
  async setEventSurveys(eventId: number, surveyIds: number[]): Promise<void> {
    return apiClient.post(`/event/${eventId}/survey-set/`, { surveys: surveyIds });
  },

  // Get event surveys
  async getEventSurveys(eventId: number): Promise<any[]> {
    return apiClient.get(`/event/${eventId}/survey-list/`);
  },

  // Get survey responses for event
  async getEventSurveyResponses(eventId: number): Promise<any[]> {
    return apiClient.get(`/event/${eventId}/survey-list-response/`);
  },

  // Send survey to participants
  async sendEventSurvey(eventId: number): Promise<void> {
    return apiClient.post(`/event/${eventId}/survey-send/`);
  },

  // Mark event as done
  async setEventDone(eventId: number): Promise<void> {
    return apiClient.post(`/event/${eventId}/set-done/`);
  },

  // Event reference management
  async createEventReference(eventId: number, referenceData: any): Promise<any> {
    return apiClient.post(`/event/${eventId}/create-event-reference/`, referenceData);
  },

  async getEventReferences(eventId: number): Promise<any[]> {
    return apiClient.get(`/event/${eventId}/list-event-reference/`);
  },

  async updateEventReference(eventId: number, referenceId: number, referenceData: any): Promise<any> {
    return apiClient.patch(`/event/${eventId}/update-event-reference/`, { 
      reference_id: referenceId, 
      ...referenceData 
    });
  },

  async deleteEventReference(eventId: number, referenceId: number): Promise<void> {
    return apiClient.delete(`/event/${eventId}/delete-event-reference/?reference_id=${referenceId}`);
  },

  // PIC registration management
  async registerParticipantByPIC(eventId: number, participantData: any): Promise<void> {
    return apiClient.post(`/event/${eventId}/registration-pic/`, participantData);
  },

  async getRegistrantsByPIC(eventId: number): Promise<any[]> {
    return apiClient.get(`/event/${eventId}/register-list-by-pic/`);
  },

  async deleteRegistration(eventId: number, registrationId: number): Promise<void> {
    return apiClient.delete(`/event/${eventId}/registration-delete/?registration_id=${registrationId}`);
  },
};