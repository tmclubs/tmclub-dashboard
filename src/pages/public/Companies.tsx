import React from 'react';
import { Link } from 'react-router-dom';
import { useCompanies } from '@/lib/hooks/useCompanies';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner, Badge } from '@/components/ui';
import { LazyImage } from '@/components/ui/LazyImage';
import { Building2, Users, MapPin, ExternalLink } from 'lucide-react';
import PublicNavbar from '@/components/landing/PublicNavbar';
import PublicFooter from '@/components/landing/PublicFooter';

const Companies: React.FC = () => {
    const { data: companies, isLoading, error } = useCompanies();

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

    if (error) {
        return (
            <>
                <PublicNavbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <Card className="max-w-md">
                        <CardContent className="p-6 text-center">
                            <p className="text-red-600">Gagal memuat data Company Members</p>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <PublicNavbar />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                        <div className="flex items-center gap-3 mb-4">
                            <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
                            <h1 className="text-3xl sm:text-4xl font-bold">Company Members</h1>
                        </div>
                        <p className="text-lg sm:text-xl text-orange-100 max-w-3xl">
                            Bergabunglah dengan ekosistem Company Members terkemuka yang menjadi bagian dari Toyota Manufacturers Club
                        </p>
                        <div className="mt-6 flex items-center gap-6 text-sm sm:text-base">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span className="font-semibold">{companies?.length || 0} Company Members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-white/20 text-white border-white/30">
                                    Verified Partners
                                </Badge>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Companies Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {companies && companies.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {companies.map((company) => (
                                <Card
                                    key={company.pk}
                                    className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-orange-300 bg-white"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                    {company.display_name}
                                                </CardTitle>
                                            </div>
                                            {company.main_image_url && (
                                                <div className="flex-shrink-0">
                                                    <LazyImage
                                                        src={company.main_image_url}
                                                        alt={company.display_name}
                                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border-2 border-gray-100 group-hover:border-orange-200 transition-colors"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {company.description && (
                                            <p className="text-sm text-gray-600 line-clamp-3">
                                                {company.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {company.city && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>{company.city}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{company.members_count || 0} Members</span>
                                            </div>
                                        </div>

                                        {company.address && (
                                            <div className="pt-2 border-t border-gray-100">
                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                    {company.address}
                                                </p>
                                            </div>
                                        )}

                                        {/* Action Link */}
                                        <div className="pt-2">
                                            <Link
                                                to={`/companies/${company.pk}`}
                                                className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 group-hover:gap-3 transition-all"
                                            >
                                                <span>Lihat Detail</span>
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 text-lg font-medium mb-2">Belum Ada Data Company Members</p>
                                <p className="text-gray-400 text-sm">Company Members akan ditampilkan di sini</p>
                            </CardContent>
                        </Card>
                    )}
                </section>



                {/* Footer */}
                <PublicFooter />
            </main>
        </>
    );
};

export default Companies;
