import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { surveysApi } from '@/lib/api/surveys';
import { Survey, SurveyFormData, SurveySubmissionData } from '@/types/api';

// Hook for getting all surveys
export const useSurveys = () => {
  return useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveysApi.getSurveys(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting single survey
export const useSurvey = (surveyId: number) => {
  return useQuery({
    queryKey: ['surveys', surveyId],
    queryFn: () => surveysApi.getSurvey(surveyId),
    enabled: !!surveyId,
  });
};

// Hook for creating survey
export const useCreateSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SurveyFormData) => surveysApi.createSurvey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey berhasil dibuat!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat survey');
    },
  });
};

// Hook for deleting survey
export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (surveyId: number) => surveysApi.deleteSurvey(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey berhasil dihapus!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus survey');
    },
  });
};

// Hook for submitting survey response
export const useSubmitSurveyResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: number; data: SurveySubmissionData }) =>
      surveysApi.submitSurveyResponse(surveyId, data),
    onSuccess: (_, { surveyId }) => {
      queryClient.invalidateQueries({ queryKey: ['surveys', surveyId] });
      toast.success('Jawaban survey berhasil dikirim!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim jawaban');
    },
  });
};

// Hook for getting survey results
export const useSurveyResults = (surveyId: number) => {
  return useQuery({
    queryKey: ['surveys', surveyId, 'results'],
    queryFn: () => surveysApi.getSurveyResults(surveyId),
    enabled: !!surveyId,
  });
};

// Hook for exporting survey results
export const useExportSurveyResults = () => {
  return useMutation({
    mutationFn: (surveyId: number) => surveysApi.exportSurveyResults(surveyId),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'survey-results.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Hasil survey berhasil diekspor!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengekspor hasil survey');
    },
  });
};

// Hook for sending survey invitation
export const useSendSurveyInvitation = () => {
  return useMutation({
    mutationFn: ({ surveyId, emails, message }: {
      surveyId: number;
      emails: string[];
      message?: string
    }) => surveysApi.sendSurveyInvitation(surveyId, emails, message),
    onSuccess: () => {
      toast.success('Undangan survey berhasil dikirim!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim undangan');
    },
  });
};

// Event Survey Hooks
// Hook for getting event surveys
export const useEventSurveys = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'surveys'],
    queryFn: () => surveysApi.getEventSurveys(eventId),
    enabled: !!eventId,
  });
};

// Hook for creating event survey
export const useCreateEventSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: number; data: SurveyFormData }) =>
      surveysApi.createEventSurvey(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'surveys'] });
      toast.success('Survey event berhasil dibuat!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat survey event');
    },
  });
};

// Hook for getting event survey detail
export const useEventSurveyDetail = (eventId: number, surveyId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'surveys', surveyId],
    queryFn: () => surveysApi.getEventSurveyDetail(eventId, surveyId),
    enabled: !!eventId && !!surveyId,
  });
};

// Hook for submitting event survey response
export const useSubmitEventSurveyResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, surveyId, data }: {
      eventId: number;
      surveyId: number;
      data: SurveySubmissionData
    }) => surveysApi.submitEventSurveyResponse(eventId, surveyId, data),
    onSuccess: (_, { eventId, surveyId }) => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'surveys', surveyId] });
      toast.success('Jawaban survey event berhasil dikirim!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim jawaban survey');
    },
  });
};

// Hook for getting surveys needing response
export const useSurveysNeedingResponse = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'surveys-needing-response'],
    queryFn: () => surveysApi.getSurveysNeedingResponse(eventId),
    enabled: !!eventId,
  });
};

// Hook for exporting event survey results
export const useExportEventSurveyResults = () => {
  return useMutation({
    mutationFn: ({ eventId, surveyId }: { eventId: number; surveyId: number }) =>
      surveysApi.exportEventSurveyResults(eventId, surveyId),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event-survey-results.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Hasil survey event berhasil diekspor!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengekspor hasil survey event');
    },
  });
};