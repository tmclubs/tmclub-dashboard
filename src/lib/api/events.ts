import { apiClient } from './client';
import { Event, EventFormData, EventRegistration } from '@/types/api';

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
    return apiClient.get(`/event/${eventId}/qrcode/`);
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
    return apiClient.post(`/event/${eventId}/upload-media/`, { files: fileIds });
  },

  // Set surveys for event
  async setEventSurveys(eventId: number, surveyIds: number[]): Promise<void> {
    return apiClient.post(`/event/${eventId}/survey-set/`, { surveys: surveyIds });
  },

  // Get event surveys
  async getEventSurveys(eventId: number): Promise<any[]> {
    return apiClient.get(`/event/${eventId}/survey-list/`);
  },
};