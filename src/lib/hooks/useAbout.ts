import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { aboutApi } from '@/lib/api/about';
import { QUERY_KEYS } from '@/lib/constants/api';
import { UpdateAboutPayload } from '@/types/api';

export const useAbout = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ABOUT,
    queryFn: () => aboutApi.getAbout(),
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
};

export const useUpdateAbout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAboutPayload }) => aboutApi.updateAbout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ABOUT });
      toast.success('About berhasil diperbarui!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui About');
    },
  });
};