import { apiClient } from './client';
import { Survey, SurveyFormData, SurveySubmissionData } from '@/types/api';

export const surveysApi = {
  // Get all surveys
  async getSurveys(): Promise<Survey[]> {
    return apiClient.get('/survey/');
  },

  // Get survey by ID
  async getSurvey(surveyId: number): Promise<Survey> {
    return apiClient.get(`/survey/${surveyId}/`);
  },

  // Create new survey
  async createSurvey(data: SurveyFormData): Promise<Survey> {
    return apiClient.post('/survey/', data);
  },

  // Delete survey
  async deleteSurvey(surveyId: number): Promise<void> {
    return apiClient.delete(`/survey/${surveyId}/`);
  },

  // Submit survey response
  async submitSurveyResponse(surveyId: number, data: SurveySubmissionData): Promise<void> {
    return apiClient.post(`/survey/${surveyId}/response/`, data);
  },

  // Get survey results
  async getSurveyResults(surveyId: number): Promise<any> {
    return apiClient.get(`/survey/${surveyId}/result/`);
  },

  // Export survey results
  async exportSurveyResults(surveyId: number): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/survey/${surveyId}/result-export/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export survey results');
    }

    return response.blob();
  },

  // Send survey invitation
  async sendSurveyInvitation(surveyId: number, emails: string[], message?: string): Promise<void> {
    return apiClient.post(`/survey/${surveyId}/send/`, { emails, message });
  },

  // Event Survey Integration
  // Get surveys for specific event
  async getEventSurveys(eventId: number): Promise<Survey[]> {
    return apiClient.get(`/survey/${eventId}/`);
  },

  // Create survey for specific event
  async createEventSurvey(eventId: number, data: SurveyFormData): Promise<Survey> {
    return apiClient.post(`/survey/${eventId}/`, data);
  },

  // Get specific survey for event
  async getEventSurveyDetail(eventId: number, surveyId: number): Promise<Survey> {
    return apiClient.get(`/survey/${eventId}/${surveyId}/`);
  },

  // Submit response to event survey
  async submitEventSurveyResponse(eventId: number, surveyId: number, data: SurveySubmissionData): Promise<void> {
    return apiClient.post(`/survey/${eventId}/${surveyId}/response/`, data);
  },

  // Get results for event survey
  async getEventSurveyResults(eventId: number, surveyId: number): Promise<any> {
    return apiClient.get(`/survey/${eventId}/${surveyId}/result/`);
  },

  // Export event survey results
  async exportEventSurveyResults(eventId: number, surveyId: number): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/survey/${eventId}/${surveyId}/result-export/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export event survey results');
    }

    return response.blob();
  },

  // Get surveys that need response for specific event
  async getSurveysNeedingResponse(eventId: number): Promise<Survey[]> {
    return apiClient.get(`/event/${eventId}/survey-need-response/`);
  },
};