import React from 'react';
import { Building2, Users, MapPin, Calendar, MoreHorizontal, Mail, Edit, Trash2, Eye, ExternalLink, Shield } from 'lucide-react';
import { Card, CardContent, Badge, Button, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/date';

export interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  industry: string;
  location: string;
  website?: string;
  email: string;
  phone?: string;
  memberCount: number;
  eventCount: number;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  verified: boolean;
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
  };
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <Card className={cn("group hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden", className)}>
        {/* Header with Logo */}
        <div className="relative p-6 bg-gradient-to-br from-orange-50 to-pink-50">
          <div className="absolute top-3 right-3">
            <div className="flex gap-2">
              {company.verified && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge className={cn("text-xs", getStatusColor(company.status))}>
                {company.status}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Avatar
              src={company.logo}
              name={company.name}
              size="lg"
              className="mb-4 border-4 border-white shadow-lg"
            />
            <h3 className="font-bold text-lg text-gray-900 text-center line-clamp-2">
              {company.name}
            </h3>
            <Badge className={cn("mt-2", getIndustryColor(company.industry))}>
              {company.industry}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3 text-center">
            {company.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{company.memberCount}</span>
              </div>
              <p className="text-xs text-gray-500">Members</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">{company.eventCount}</span>
              </div>
              <p className="text-xs text-gray-500">Events</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{company.location}</span>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(company)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(company)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(company)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
              src={company.logo}
              name={company.name}
              size="md"
              className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {company.name}
                    </h3>
                    {company.verified && (
                      <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", getIndustryColor(company.industry))}>
                      {company.industry}
                    </Badge>
                    <Badge className={cn("text-xs", getStatusColor(company.status))}>
                      {company.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{company.memberCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{company.location}</span>
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
              name={company.name}
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
                    {company.name}
                  </h3>
                  {company.verified && (
                    <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={cn("text-xs", getIndustryColor(company.industry))}>
                    {company.industry}
                  </Badge>
                  <Badge className={cn("text-xs", getStatusColor(company.status))}>
                    {company.status}
                  </Badge>
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
                <span className="line-clamp-1">{company.location}</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};