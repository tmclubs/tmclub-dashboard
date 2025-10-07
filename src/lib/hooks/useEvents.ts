import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { eventsApi } from '@/lib/api/events';
import { Event, EventFormData, EventRegistration } from '@/types/api';
import { isAuthenticated } from '@/lib/api/client';

// Hook for getting all events
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getEvents(),
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
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
    queryFn: () => eventsApi.getRegistrantList(eventId),
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
    queryFn: () => eventsApi.getQRCode(eventId),
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
      eventsApi.uploadMedia(eventId, fileIds),
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
    mutationFn: (eventId: number) => eventsApi.downloadCertificate(eventId),
    onSuccess: () => {
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
      eventsApi.setEventSurvey(eventId, surveyIds),
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
    mutationFn: (eventId: number) => eventsApi.exportRegistrants(eventId),
    onSuccess: () => {
      toast.success('Daftar registrant berhasil diexport!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengekspor registran');
    },
  });
};


// Hook for downloading event certificate
export const useDownloadEventCertificate = () => {
  return useMutation({
    mutationFn: (eventId: number) => eventsApi.downloadEventCertificate(eventId),
    onSuccess: (blob) => {
      // Create download link
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

// Hook for exporting event registrants
export const useExportEventRegistrants = () => {
  return useMutation({
    mutationFn: (eventId: number) => eventsApi.exportEventRegistrants(eventId),
    onSuccess: () => {
      toast.success('Data registrant berhasil diekspor!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengekspor data');
    },
  });
};