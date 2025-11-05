import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { eventsApi } from '@/lib/api/events';
import { EventFormData, EventRegistration } from '@/types/api';
import { isAuthenticated } from '@/lib/api/client';

// Hook for getting all events
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getEvents(),
    enabled: isAuthenticated(),
    retry: 1,
    // Lebih realtime: refresh berkala dan saat focus/reconnect
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 15 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// Hook for getting single event
export const useEvent = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventsApi.getEvent(eventId),
    enabled: isAuthenticated() && !!eventId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting event registrants list
export const useEventRegistrants = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'registrants'],
    queryFn: () => eventsApi.getEventRegistrants(eventId),
    enabled: isAuthenticated() && !!eventId,
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook for getting events created by current user
export const useMyEvents = () => {
  return useQuery({
    queryKey: ['my-events'],
    queryFn: () => eventsApi.getMyEvents(),
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting events where user is registered
export const useMyRegisteredEvents = () => {
  return useQuery({
    queryKey: ['my-registered-events'],
    queryFn: () => eventsApi.getMyRegisteredEvents(),
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting event QR code
export const useEventQRCode = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'qrcode'],
    queryFn: () => eventsApi.getEventQRCode(eventId),
    enabled: isAuthenticated() && !!eventId,
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for creating event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventFormData) => eventsApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      toast.success('Event berhasil dibuat!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat event');
    },
  });
};

// Hook for updating event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: number; data: Partial<EventFormData> }) =>
      eventsApi.updateEvent(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      toast.success('Event berhasil diperbarui!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui event');
    },
  });
};

// Hook for deleting event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventsApi.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      toast.success('Event berhasil dihapus!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus event');
    },
  });
};

// Hook for registering to event
export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: number; data: EventRegistration }) =>
      eventsApi.registerForEvent(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['my-registered-events'] });
      toast.success('Registrasi event berhasil!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mendaftar event');
    },
  });
};

// Hook for uploading event media
export const useUploadEventMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, fileIds }: { eventId: number; fileIds: number[] }) =>
      eventsApi.uploadEventMedia(eventId, fileIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      toast.success('Media berhasil diupload!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengupload media');
    },
  });
};

// Hook for downloading event certificate
export const useDownloadCertificate = () => {
  return useMutation({
    mutationFn: (eventId: number) => eventsApi.downloadEventCertificate(eventId),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'event-certificate.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Sertifikat berhasil diunduh!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengunduh sertifikat');
    },
  });
};

// Hook for setting event surveys
export const useSetEventSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, surveyIds }: { eventId: number; surveyIds: number[] }) =>
      eventsApi.setEventSurveys(eventId, surveyIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      toast.success('Survey berhasil ditetapkan ke event!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menetapkan survey');
    },
  });
};

// Hook for exporting event registrants
export const useExportRegistrants = () => {
  return useMutation({
    mutationFn: (eventId: number) => eventsApi.exportEventRegistrants(eventId),
    onSuccess: () => {
      toast.success('Daftar registrant berhasil diexport!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengekspor registran');
    },
  });
};


// Hook for getting event survey responses
export const useEventSurveyResponses = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'survey-responses'],
    queryFn: () => eventsApi.getEventSurveyResponses(eventId),
    enabled: isAuthenticated() && !!eventId,
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook for sending survey to participants
export const useSendEventSurvey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventsApi.sendEventSurvey(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      toast.success('Survey berhasil dikirim ke peserta!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim survey');
    },
  });
};

// Hook for marking event as done
export const useSetEventDone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventsApi.setEventDone(eventId),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      toast.success('Event berhasil ditandai selesai!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menandai event selesai');
    },
  });
};

// Hook for getting event references
export const useEventReferences = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'references'],
    queryFn: () => eventsApi.getEventReferences(eventId),
    enabled: isAuthenticated() && !!eventId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating event reference
export const useCreateEventReference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, referenceData }: { eventId: number; referenceData: any }) =>
      eventsApi.createEventReference(eventId, referenceData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'references'] });
      toast.success('Referensi event berhasil dibuat!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat referensi');
    },
  });
};

// Hook for updating event reference
export const useUpdateEventReference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, referenceId, referenceData }: { 
      eventId: number; 
      referenceId: number; 
      referenceData: any 
    }) => eventsApi.updateEventReference(eventId, referenceId, referenceData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'references'] });
      toast.success('Referensi event berhasil diperbarui!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui referensi');
    },
  });
};

// Hook for deleting event reference
export const useDeleteEventReference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, referenceId }: { eventId: number; referenceId: number }) =>
      eventsApi.deleteEventReference(eventId, referenceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'references'] });
      toast.success('Referensi event berhasil dihapus!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus referensi');
    },
  });
};

// Hook for registering participant by PIC
export const useRegisterParticipantByPIC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, participantData }: { eventId: number; participantData: any }) =>
      eventsApi.registerParticipantByPIC(eventId, participantData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'registrants'] });
      toast.success('Peserta berhasil didaftarkan oleh PIC!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mendaftarkan peserta');
    },
  });
};

// Hook for getting registrants by PIC
export const useRegistrantsByPIC = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'registrants-by-pic'],
    queryFn: () => eventsApi.getRegistrantsByPIC(eventId),
    enabled: isAuthenticated() && !!eventId,
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook for deleting registration
export const useDeleteRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, registrationId }: { eventId: number; registrationId: number }) =>
      eventsApi.deleteRegistration(eventId, registrationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'registrants'] });
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'registrants-by-pic'] });
      toast.success('Registrasi berhasil dihapus!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus registrasi');
    },
  });
};