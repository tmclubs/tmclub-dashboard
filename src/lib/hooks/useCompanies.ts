import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { companiesApi } from '@/lib/api/companies';
import { CompanyFormData, CompanyInviteData } from '@/types/api';
import { isAuthenticated } from '@/lib/api/client';

// Hook for getting all companies
export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.getCompanies(),
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting single company (Public - no auth required)
export const useCompany = (companyId: number) => {
  return useQuery({
    queryKey: ['companies', companyId],
    queryFn: () => companiesApi.getCompany(companyId),
    enabled: !!companyId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating company
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompanyFormData) => companiesApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company berhasil dibuat!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat company');
    },
  });
};

// Hook for updating company
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: number; data: Partial<CompanyFormData> }) =>
      companiesApi.updateCompany(companyId, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
      toast.success('Company berhasil diperbarui!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui company');
    },
  });
};

// Hook for deleting company
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: number) => companiesApi.deleteCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company berhasil dihapus!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus company');
    },
  });
};

// Hook for inviting company member
export const useInviteCompanyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: number; data: CompanyInviteData }) =>
      companiesApi.inviteCompanyMember(companyId, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
      toast.success('Undangan berhasil dikirim!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim undangan');
    },
  });
};

// Hook for inviting company PIC
export const useInviteCompanyPIC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, email }: { companyId: number; email: string }) =>
      companiesApi.inviteCompanyPIC(companyId, email),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
      toast.success('PIC berhasil diundang!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mengundang PIC');
    },
  });
};

// Hook for removing company member
export const useRemoveCompanyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, email }: { companyId: number; email: string }) =>
      companiesApi.removeCompanyMember(companyId, email),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
      toast.success('Member berhasil dihapus!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus member');
    },
  });
};

// Hook for removing company PIC
export const useRemoveCompanyPIC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, email }: { companyId: number; email: string }) =>
      companiesApi.removeCompanyPIC(companyId, email),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
      toast.success('PIC berhasil dihapus!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus PIC');
    },
  });
};

// Hook for setting company VA
export const useSetCompanyVA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, transactionNumber }: { companyId: number; transactionNumber: string }) =>
      companiesApi.setCompanyVA(companyId, transactionNumber),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
      toast.success('Virtual Account berhasil diset!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menyet Virtual Account');
    },
  });
};