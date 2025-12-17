import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea, LoadingSpinner, Select, Input, Badge } from '@/components/ui';
import { TiptapEditor } from '@/components/features/blog';
import { MarkdownRenderer } from '@/components/features/blog/MarkdownRenderer';
import { htmlToMarkdown } from '@/lib/utils/markdown';
import { useAbout, useUpdateAbout, useCreateAbout } from '@/lib/hooks/useAbout';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { usePermissions } from '../../lib/hooks/usePermissions';
import { Save, Plus, X, Info, Building2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { renderToStaticMarkup } from 'react-dom/server';
import toast from 'react-hot-toast';

export const AboutPage: React.FC = () => {
  const { data: about, isLoading, error } = useAbout();
  const updateAbout = useUpdateAbout();
  const createAbout = useCreateAbout();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const canEdit = isAdmin() || isSuperAdmin();

  const [editorHtml, setEditorHtml] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [organizations, setOrganizations] = React.useState<number[]>([]);
  const [annualDirs, setAnnualDirs] = React.useState<number[]>([]);
  const [newAnnualId, setNewAnnualId] = React.useState<string>('');

  const { data: companies } = useCompanies();

  const companyNameById = React.useMemo(() => {
    const map = new Map<number, string>();
    (companies || []).forEach((c) => map.set(c.pk, c.display_name));
    return map;
  }, [companies]);
  const companyOptions = (companies || []).map((c) => ({ value: String(c.pk), label: c.display_name }));

  React.useEffect(() => {
    if (!about) return;

    setDescription(about.description || '');
    setOrganizations(about.organizations || []);
    setAnnualDirs(about.annual_directories || []);

    const rawMd = about.md || '';
    let initialHtml = '';
    if (rawMd) {
      try {
        initialHtml = renderToStaticMarkup(
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {rawMd}
          </ReactMarkdown>
        );
      } catch (_err) {
        initialHtml = rawMd;
      }
    }

    setEditorHtml(initialHtml);
  }, [about, isLoading, error]);

  const handleSave = () => {
    if (!about?.id) {
      toast.error('Data About tidak ditemukan');
      return;
    }

    const markdown = htmlToMarkdown(editorHtml);

    const payload = {
      md: markdown,
      description,
      organizations,
      annual_directories: annualDirs,
    };

    updateAbout.mutate({
      id: about.id,
      data: payload,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600">Gagal memuat data About.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if ((!about || !about.id) && !canEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Data About belum tersedia.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tentang TMClub</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={about?.md || ''} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Anda tidak memiliki akses untuk mengubah konten About.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const previewMd = htmlToMarkdown(editorHtml);

  const handleOrganizationsChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const values = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
    setOrganizations(values);
  };

  const addAnnualId = () => {
    const num = Number(newAnnualId);
    if (!num || Number.isNaN(num)) return;
    setAnnualDirs((prev) => (prev.includes(num) ? prev : [...prev, num]));
    setNewAnnualId('');
  };

  const removeAnnualId = (id: number) => {
    setAnnualDirs((prev) => prev.filter((x) => x !== id));
  };

  const removeOrgId = (id: number) => {
    setOrganizations((prev) => prev.filter((x) => x !== id));
  };

  // Create form if no data exists
  if ((!about || !about.id) && canEdit) {
    const handleCreate = () => {
      const markdown = htmlToMarkdown(editorHtml);
      createAbout.mutate({
        md: markdown,
        description,
        organizations,
        annual_directories: annualDirs,
      });
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Modern Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 p-6 sm:p-8 shadow-xl">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">About Page</h1>
                  </div>
                  <p className="text-orange-100 text-sm sm:text-base">
                    Buat konten About TMClub
                  </p>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={createAbout.isPending}
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg hover:shadow-xl transition-all"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Editor Card */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <TiptapEditor
                    content={editorHtml}
                    onChange={setEditorHtml}
                    placeholder="Tulis konten About di sini..."
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi singkat</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Deskripsi ringkas untuk About"
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Organizations</label>
                      <Select
                        multiple
                        options={companyOptions}
                        value={organizations.map(String)}
                        onChange={handleOrganizationsChange}
                        helperText="Hold down 'Control', atau 'Command' di Mac, untuk memilih lebih dari satu."
                      />
                      {organizations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {organizations.map((id) => (
                            <Badge key={id} className="flex items-center gap-1 pr-1">
                              <Building2 className="w-3 h-3" />
                              <span>{companyNameById.get(id) || `ID ${id}`}</span>
                              <button
                                type="button"
                                className="ml-1 hover:bg-gray-200 rounded p-0.5 transition-colors"
                                onClick={() => removeOrgId(id)}
                                aria-label={`Remove ${companyNameById.get(id) || id}`}
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Annual directories</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Masukkan ID"
                          value={newAnnualId}
                          onChange={(e) => setNewAnnualId(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={addAnnualId}
                          variant="outline"
                          className="flex-shrink-0"
                          title="Tambah ID"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {annualDirs.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {annualDirs.map((id) => (
                            <Badge key={id} className="flex items-center gap-1 pr-1">
                              <span>ID {id}</span>
                              <button
                                type="button"
                                className="ml-1 hover:bg-gray-200 rounded p-0.5 transition-colors"
                                onClick={() => removeAnnualId(id)}
                                aria-label={`Remove ${id}`}
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">Data Annual Directories belum terhubung ke daftar otomatis. Masukkan ID secara manual untuk sementara.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <MarkdownRenderer content={previewMd} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Edit form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Modern Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 p-6 sm:p-8 shadow-xl">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">About Page</h1>
                </div>
                <p className="text-orange-100 text-sm sm:text-base">
                  Kelola konten About TMClub
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={updateAbout.isPending}
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg hover:shadow-xl transition-all"
                title={updateAbout.isPending ? 'Menyimpan...' : 'Simpan'}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {updateAbout.isError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">
                  Gagal menyimpan About
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{updateAbout.error?.message || 'Terjadi kesalahan'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Editor Card */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <TiptapEditor
                  content={editorHtml}
                  onChange={setEditorHtml}
                  placeholder="Tulis konten About di sini..."
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi singkat</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi ringkas untuk About"
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organizations</label>
                    <Select
                      multiple
                      options={companyOptions}
                      value={organizations.map(String)}
                      onChange={handleOrganizationsChange}
                      helperText="Hold down 'Control', atau 'Command' di Mac, untuk memilih lebih dari satu."
                    />
                    {organizations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {organizations.map((id) => (
                          <Badge key={id} className="flex items-center gap-1 pr-1">
                            <Building2 className="w-3 h-3" />
                            <span>{companyNameById.get(id) || `ID ${id}`}</span>
                            <button
                              type="button"
                              className="ml-1 hover:bg-gray-200 rounded p-0.5 transition-colors"
                              onClick={() => removeOrgId(id)}
                              aria-label={`Remove ${companyNameById.get(id) || id}`}
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Annual directories</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Masukkan ID"
                        value={newAnnualId}
                        onChange={(e) => setNewAnnualId(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addAnnualId}
                        variant="outline"
                        className="flex-shrink-0"
                        title="Tambah ID"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {annualDirs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {annualDirs.map((id) => (
                          <Badge key={id} className="flex items-center gap-1 pr-1">
                            <span>ID {id}</span>
                            <button
                              type="button"
                              className="ml-1 hover:bg-gray-200 rounded p-0.5 transition-colors"
                              onClick={() => removeAnnualId(id)}
                              aria-label={`Remove ${id}`}
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Data Annual Directories belum terhubung ke daftar otomatis. Masukkan ID secara manual untuk sementara.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <MarkdownRenderer content={previewMd} variant="prose" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
