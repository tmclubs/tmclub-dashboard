import React from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Shield,
  Activity,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'member' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  company?: {
    id: string;
    name: string;
    position: string;
  };
  location: string;
  joinDate: string;
  lastActive?: string;
  eventsAttended: number;
  totalSpent: number;
  membershipType: 'basic' | 'premium' | 'enterprise';
  skills: string[];
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface MemberCardProps {
  member: Member;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
  onView?: (member: Member) => void;
  onSuspend?: (member: Member) => void;
  onActivate?: (member: Member) => void;
  className?: string;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  showActions = true,
  variant = 'default',
  onEdit,
  onDelete,
  onView,
  onSuspend,
  onActivate,
  className,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      case 'member':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'enterprise':
        return 'success';
      case 'premium':
        return 'warning';
      case 'basic':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const fullName = `${member.firstName} ${member.lastName}`;

  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={member.avatar}
                alt={fullName}
                size="sm"
                className="w-10 h-10"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{fullName}</h4>
                  <Badge variant={getStatusColor(member.status)} size="sm">
                    {member.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{member.email}</p>
                {member.company && (
                  <p className="text-xs text-gray-500">
                    {member.company.name} • {member.company.position}
                  </p>
                )}
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-1">
                {onView && (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn('hover:shadow-lg transition-shadow', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={member.avatar}
                alt={fullName}
                size="lg"
                className="w-16 h-16"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
                  <Badge variant={getRoleColor(member.role)}>
                    <Shield className="w-3 h-3 mr-1" />
                    {member.role}
                  </Badge>
                  <Badge variant={getMembershipColor(member.membershipType)}>
                    {member.membershipType}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{member.email}</p>
                {member.phone && (
                  <p className="text-sm text-gray-600">{member.phone}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Joined {formatDate(member.joinDate)}
                  </span>
                </div>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {onView && (
                  <Button variant="ghost" size="sm" onClick={() => onView(member)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(member)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {member.status === 'active' && onSuspend && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSuspend(member)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
                {member.status !== 'active' && onActivate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onActivate(member)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(member)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Company Info */}
          {member.company && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {member.company.name}
                </span>
                <span className="text-sm text-gray-600">• {member.company.position}</span>
              </div>
            </div>
          )}

          {/* Location and Activity */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{member.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last active: {member.lastActive ? formatDate(member.lastActive) : 'Never'}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{member.eventsAttended}</div>
              <div className="text-xs text-blue-600">Events</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Rp {member.totalSpent.toLocaleString('id-ID')}</div>
              <div className="text-xs text-green-600">Total Spent</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{member.skills.length}</div>
              <div className="text-xs text-purple-600">Skills</div>
            </div>
          </div>

          {/* Skills */}
          {member.skills.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {member.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {skill}
                  </Badge>
                ))}
                {member.skills.length > 5 && (
                  <Badge variant="outline" size="sm">
                    +{member.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Bio */}
          {member.bio && (
            <div className="text-sm text-gray-600 line-clamp-3">
              {member.bio}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={member.avatar}
              alt={fullName}
              size="lg"
              className="w-12 h-12"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{fullName}</h3>
                <Badge variant={getRoleColor(member.role)} size="sm">
                  {member.role}
                </Badge>
                <Badge variant={getStatusColor(member.status)} size="sm">
                  {member.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{member.email}</p>
              {member.company && (
                <p className="text-sm text-gray-500">
                  {member.company.position} at {member.company.name}
                </p>
              )}
            </div>
          </div>

          {showActions && (
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{member.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Joined {formatDate(member.joinDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>{member.eventsAttended} events</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="capitalize">{member.membershipType}</span>
          </div>
        </div>

        {member.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {member.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" size="sm">
                {skill}
              </Badge>
            ))}
            {member.skills.length > 3 && (
              <Badge variant="outline" size="sm">
                +{member.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => onView?.(member)}>
              View Profile
            </Button>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
                Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};