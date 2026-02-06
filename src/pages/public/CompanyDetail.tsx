import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompany, useCompanyProducts } from '@/lib/hooks/useCompanies';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    LoadingSpinner,
    Button,
    Avatar,
    Badge
} from '@/components/ui';
import { LazyImage } from '@/components/common/LazyImage';
import { Building2, MapPin, Mail, Phone, ArrowLeft, Users, Package } from 'lucide-react';
import PublicNavbar from '@/components/landing/PublicNavbar';
import PublicFooter from '@/components/landing/PublicFooter';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getBackendImageUrl } from '@/lib/utils/image';

const CompanyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: company, isLoading, error } = useCompany(Number(id));
    const { data: products } = useCompanyProducts(Number(id));

    // Merge products into company data
    const companyWithData = useMemo(() => {
        if (!company) return null;
        return {
            ...company,
            products: products || [],
        };
    }, [company, products]);

    if (isLoading) {
        return (
            <>
                <PublicNavbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                </div>
            </>
        );
    }

    if (error || !companyWithData) {
        return (
            <>
                <PublicNavbar />
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Member Tidak Ditemukan</h2>
                    <p className="text-gray-600 mb-6">Data Company Member tidak tersedia</p>
                    <Button onClick={() => navigate('/companies')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Daftar Company Members
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <PublicNavbar />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
                {/* Header with Image */}
                <section className="bg-gradient-to-r from-orange-600 to-orange-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/companies')}
                            className="text-white hover:bg-white/20 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>

                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {companyWithData.main_image_url && (
                                <div className="flex-shrink-0">
                                    <LazyImage
                                        src={getBackendImageUrl(companyWithData.main_image_url) || ''}
                                        alt={companyWithData.display_name}
                                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                    {companyWithData.display_name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        <span>{companyWithData.city}</span>
                                    </div>
                                    {companyWithData.members_count !== undefined && (
                                        <div className="flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            <span>{companyWithData.members_count} Members</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column - President Director Profile */}
                        <div className="lg:col-span-4 space-y-6">
                            {companyWithData.president_director && (
                                <Card className="overflow-hidden border-orange-100 shadow-sm">
                                    <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 relative">
                                        <div className="absolute inset-0 bg-transparent" />
                                    </div>
                                    <div className="relative -mt-12 flex justify-center mb-4">
                                        <Avatar
                                            className="w-24 h-24 border-4 border-white shadow-md text-2xl bg-white"
                                            name={companyWithData.president_director || 'PD'}
                                            src={getBackendImageUrl(companyWithData.president_director_image_url) || undefined}
                                            size="xl"
                                        />
                                    </div>
                                    <CardContent className="pb-8 pt-0 text-center space-y-2">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {companyWithData.president_director}
                                        </h3>
                                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
                                            President Director
                                        </Badge>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Contact Info Card - Moved to Left Column */}
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Informasi Kontak</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {companyWithData.email && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-500">Email</p>
                                                <a
                                                    href={`mailto:${companyWithData.email}`}
                                                    className="text-sm font-medium text-gray-900 hover:text-orange-600 break-all"
                                                >
                                                    {companyWithData.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {companyWithData.contact && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-500">Telepon</p>
                                                <a
                                                    href={`tel:${companyWithData.contact}`}
                                                    className="text-sm font-medium text-gray-900 hover:text-orange-600"
                                                >
                                                    {companyWithData.contact}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {companyWithData.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-500">Alamat</p>
                                                <p className="text-sm font-medium text-gray-900">{companyWithData.address}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{companyWithData.city}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-orange-600" />
                                        Tentang Company Member
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none text-gray-700">
                                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                            {companyWithData.description || 'Tidak ada deskripsi tersedia.'}
                                        </ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>



                            {/* Products Gallery Section */}
                            {companyWithData.products && companyWithData.products.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Package className="w-5 h-5 text-orange-600" />
                                                Produk & Layanan
                                            </CardTitle>
                                            <span className="text-sm text-gray-500">
                                                {companyWithData.products_count || companyWithData.products.length} Produk
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Instagram-style Grid Layout */}
                                        <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
                                            {companyWithData.products.map((product) => (
                                                <div
                                                    key={product.pk}
                                                    className="relative aspect-square rounded-sm overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity"
                                                >
                                                    <LazyImage
                                                        src={product.image_url || '/placeholder-product.png'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {/* Product Info Overlay on Hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                                            <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {companyWithData.products_count && companyWithData.products_count > 9 && (
                                            <div className="text-center mt-4">
                                                <Button variant="outline" size="sm">
                                                    Lihat Semua Produk ({companyWithData.products_count})
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Members Section */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-orange-600" />
                                            Anggota Perusahaan
                                        </CardTitle>
                                        <span className="text-sm text-gray-500">
                                            {companyWithData.members_count || 0} Anggota
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {companyWithData.members && companyWithData.members.length > 0 ? (
                                        <div className="space-y-3">
                                            {companyWithData.members.slice(0, 10).map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all"
                                                >
                                                    {/* Avatar */}
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-lg">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        {member.is_pic && (
                                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Member Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-gray-900">
                                                                {member.name}
                                                            </h4>
                                                            {member.is_pic && (
                                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                                    PIC
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {member.email}
                                                        </p>
                                                    </div>

                                                    {/* Join Date */}
                                                    <div className="flex-shrink-0 hidden sm:block">
                                                        <p className="text-xs text-gray-500">
                                                            Joined {new Date(member.invited_at).toLocaleDateString('id-ID', {
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className="flex-shrink-0">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Show more indicator */}
                                            {companyWithData.members.length > 10 && (
                                                <div className="text-center pt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Showing 10 of {companyWithData.members.length} members
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">Belum ada anggota terdaftar</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </section>

                {/* Footer */}
                <PublicFooter />
            </main>
        </>
    );
};

export default CompanyDetail;
