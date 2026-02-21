import React from 'react';
import { Users, MapPin, Calendar, Mail, Edit, Trash2, Eye, ExternalLink, ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, Badge, Button, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { Company as APICompany } from '@/types/api';
import { getBackendImageUrl } from '@/lib/utils/image';
import { LazyImage } from '@/components/common/LazyImage';

export interface Company extends Omit<APICompany, 'pk'> {
  id: string;
  pk?: number;
  memberCount: number;
  eventCount: number;
  joinDate: string;
  verified: boolean;
  status: 'active' | 'inactive' | 'pending';
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
  };
  industry: string;
  location: string;
  website?: string;
  logo?: string;
}

export interface CompanyCardProps {
  company: Company;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured' | 'grid';
  onView?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  className?: string;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  showActions = true,
  variant = 'default',
  onView,
  onEdit,
  onDelete,
  className,
}) => {
  const getStatusIconInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'inactive':
        return { color: 'text-gray-500 bg-gray-50 border-gray-200', icon: <XCircle className="w-4 h-4" /> };
      case 'pending':
        return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <Clock className="w-4 h-4" /> };
      default:
        return { color: 'text-gray-500 bg-gray-50 border-gray-200', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const getIndustryColor = (industry: string) => {
    const colors: { [key: string]: string } = {
      'Automotive': 'bg-blue-100 text-blue-800 border-blue-200',
      'Technology': 'bg-purple-100 text-purple-800 border-purple-200',
      'Finance': 'bg-green-100 text-green-800 border-green-200',
      'Healthcare': 'bg-red-100 text-red-800 border-red-200',
      'Education': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Manufacturing': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[industry] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const isGrid = variant === 'grid';
  const isCompact = variant === 'compact';

  if (isGrid) {
    return (
      <Card className={cn(
        "group relative bg-white overflow-hidden transition-all duration-300",
        "border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200",
        "flex flex-col h-full",
        className
      )}>
        {/* Status Indicators (Icons Only) */}
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
          {company.verified && (
            <div title="Verified" className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
          <div title={`Status: ${company.status}`} className={cn("w-7 h-7 rounded-full border flex items-center justify-center shadow-sm", getStatusIconInfo(company.status).color)}>
            {getStatusIconInfo(company.status).icon}
          </div>
        </div>

        <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
          {/* Header Layout (Logo + Title) */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
            {/* Logo Container */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-2 shadow-inner">
              {company.logo ? (
                <LazyImage
                  src={getBackendImageUrl(company.logo)}
                  alt={`${company.display_name} logo`}
                  className="w-full h-full object-contain"
                  containerClassName="w-full h-full"
                  showSkeleton={true}
                />
              ) : (
                <div className="w-full h-full bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xl">
                  {company.display_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Title & Industry */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight mb-2 pr-16 sm:pr-0">
                {company.display_name}
              </h3>
              <Badge variant="secondary" className={cn("text-xs font-medium", getIndustryColor(company.industry))}>
                {company.industry}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1">
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {company.description || "No description provided."}
            </p>
          </div>

          {/* Meta Info (Location & Stats) */}
          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{company.city || company.location || "Location not set"}</span>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{company.memberCount}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1.5 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{company.eventCount}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(company)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                View
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(company)}
                  className="bg-white hover:bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-300"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(company)}
                  className="bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow border-gray-200", className)}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Avatar
              src={getBackendImageUrl(company.logo)}
              name={company.display_name}
              size="md"
              className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {company.display_name}
                    </h3>
                    {company.verified && (
                      <span title="Verified" className="flex">
                        <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", getIndustryColor(company.industry))}>
                      {company.industry}
                    </Badge>
                    <div title={`Status: ${company.status}`} className={cn("w-6 h-6 rounded-full border flex items-center justify-center shadow-sm", getStatusIconInfo(company.status).color)}>
                      {getStatusIconInfo(company.status).icon}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{company.memberCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{company.city || company.location}</span>
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex gap-1 flex-shrink-0">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(company)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(company)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Featured/Default variant
  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 border-gray-200", className)}>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Avatar
              src={company.logo}
              name={company.display_name}
              size="xl"
              className="border-2 border-gray-200"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {company.display_name}
                  </h3>
                  {company.verified && (
                    <span title="Verified" className="flex">
                      <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={cn("text-xs", getIndustryColor(company.industry))}>
                    {company.industry}
                  </Badge>
                  <div title={`Status: ${company.status}`} className={cn("w-6 h-6 rounded-full border flex items-center justify-center shadow-sm", getStatusIconInfo(company.status).color)}>
                    {getStatusIconInfo(company.status).icon}
                  </div>
                </div>
              </div>

              {showActions && (
                <div className="flex gap-2 flex-shrink-0">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(company)}
                      className="h-9 w-9 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(company)}
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 line-clamp-2 mb-4 text-sm">
              {company.description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{company.memberCount} members</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{company.eventCount} events</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="line-clamp-1">{company.city || company.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="line-clamp-1">{company.contactPerson.email}</span>
              </div>
            </div>

            {/* Contact Person */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <p className="font-medium text-gray-900">Contact Person</p>
                <p className="text-gray-600">{company.contactPerson.name}</p>
              </div>
              <div className="flex-1 text-sm text-right">
                {company.contactPerson.phone && (
                  <p className="text-gray-600">{company.contactPerson.phone}</p>
                )}
                <p className="text-blue-600">{company.contactPerson.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(company)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-orange-300 bg-transparent hover:bg-orange-50 text-orange-700 h-9 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};