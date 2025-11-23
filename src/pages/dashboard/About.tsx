import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea, LoadingSpinner, Select, Input, Badge } from '@/components/ui';
import { TiptapEditor } from '@/components/features/blog';
import { MarkdownRenderer } from '@/components/features/blog/MarkdownRenderer';
import { htmlToMarkdown } from '@/lib/utils/markdown';
import { useAbout, useUpdateAbout } from '@/lib/hooks/useAbout';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { usePermissions } from '../../lib/hooks/usePermissions';
import { Save, Plus, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { renderToStaticMarkup } from 'react-dom/server';

export const AboutPage: React.FC = () => {
  const { data: about, isLoading, error } = useAbout();
  const updateAbout = useUpdateAbout();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const canEdit = isAdmin() || isSuperAdmin();

  const [editorHtml, setEditorHtml] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [organizations, setOrganizations] = React.useState<number[]>([]);
  const [annualDirs, setAnnualDirs] = React.useState<number[]>([]);
  const [newAnnualId, setNewAnnualId] = React.useState<string>('');

  const { data: companies } = useCompanies();

  // Panggil semua hooks sebelum early return untuk mengikuti Rules of Hooks
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
        // Fallback ke konten mentah jika konversi gagal agar tidak blank
        initialHtml = rawMd;
      }
    }

    setEditorHtml(initialHtml);
  }, [about]);

  const handleSave = () => {
    if (!about?.pk) return;
    const markdown = htmlToMarkdown(editorHtml);
    updateAbout.mutate({
      id: about.pk,
      data: {
        md: markdown,
        description,
        organizations,
        annual_directories: annualDirs,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <p className="text-red-600">Gagal memuat data About.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!about) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <p className="text-gray-600">Data About belum tersedia.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tentang TMClub</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={about.md || ''} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-gray-600">Anda tidak memiliki akses untuk mengubah konten About.</p>
          </CardContent>
        </Card>
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">About</h1>
        <Button onClick={handleSave} disabled={updateAbout.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {updateAbout.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TiptapEditor
                content={editorHtml}
                onChange={setEditorHtml}
                placeholder="Tulis konten About di sini..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi singkat</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi ringkas untuk About"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organizations</label>
                  <Select
                    multiple
                    options={companyOptions}
                    value={organizations.map(String)}
                    onChange={handleOrganizationsChange}
                    helperText={"Hold down 'Control', atau 'Command' di Mac, untuk memilih lebih dari satu."}
                  />
                  {organizations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {organizations.map((id) => (
                        <span key={id} className="inline-flex items-center">
                          <Badge>{companyNameById.get(id) || `ID ${id}`}</Badge>
                          <button
                            type="button"
                            className="ml-1 text-gray-500 hover:text-red-600"
                            onClick={() => removeOrgId(id)}
                            aria-label={`Remove ${companyNameById.get(id) || id}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual directories</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Masukkan ID"
                      value={newAnnualId}
                      onChange={(e) => setNewAnnualId(e.target.value)}
                    />
                    <Button type="button" onClick={addAnnualId}>
                      <Plus className="w-4 h-4 mr-1" />Tambah
                    </Button>
                  </div>
                  {annualDirs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {annualDirs.map((id) => (
                        <span key={id} className="inline-flex items-center">
                          <Badge>{`ID ${id}`}</Badge>
                          <button
                            type="button"
                            className="ml-1 text-gray-500 hover:text-red-600"
                            onClick={() => removeAnnualId(id)}
                            aria-label={`Remove ${id}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">Data Annual Directories belum terhubung ke daftar otomatis. Masukkan ID secara manual untuk sementara.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={previewMd} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;