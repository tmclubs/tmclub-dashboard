import React from 'react';
import { Calendar, MapPin, Users, Star, Eye, Edit, Trash2, ExternalLink, Wifi, Monitor, Map } from 'lucide-react';
import { Card, CardContent, Badge, Button, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';

export interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    venue: string;
    price: number;
    isFree: boolean;
    eventType: 'offline' | 'online' | 'hybrid';
    maxParticipants?: number;
    currentRegistrants?: number;
    mainImage?: {
      id: string;
      image: string;
      caption?: string;
    };
    isRegistrationClose: boolean;
    isPast: boolean;
    organizer?: {
      id: string;
      name: string;
      avatar?: string;
    };
    rating?: number;
    reviewsCount?: number;
    status: 'draft' | 'published' | 'cancelled';
  };
  variant?: 'default' | 'compact' | 'featured' | 'grid';
  showActions?: boolean;
  showOrganizer?: boolean;
  showStats?: boolean;
  onView?: (event: any) => void;
  onEdit?: (event: any) => void;
  onDelete?: (event: any) => void;
  onRegister?: (event: any) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'default',
  showActions = false,
  showOrganizer = false,
  showStats = false,
  onView,
  onEdit,
  onDelete,
  onRegister,
  className,
}) => {
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return <Wifi className="w-4 h-4" />;
      case 'offline': return <Map className="w-4 h-4" />;
      case 'hybrid': return <Monitor className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'online': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offline': return 'bg-green-100 text-green-800 border-green-200';
      case 'hybrid': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string, isPast: boolean) => {
    if (isPast) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (status === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'draft') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const isGrid = variant === 'grid';
  const isCompact = variant === 'compact';

  if (isGrid) {
    return (
      <Card className={cn("group hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden", className)}>
        {/* Image Section */}
        {event.mainImage ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={event.mainImage.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={cn("text-xs border backdrop-blur-sm", getEventTypeColor(event.eventType))}>
                {getEventTypeIcon(event.eventType)}
                <span className="ml-1 capitalize">{event.eventType}</span>
              </Badge>
              <Badge className={cn("text-xs border backdrop-blur-sm", getStatusColor(event.status, event.isPast))}>
                {event.isPast ? 'Past' : event.status}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-orange-400 to-pink-400 relative">
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={cn("text-xs border backdrop-blur-sm", getEventTypeColor(event.eventType))}>
                {getEventTypeIcon(event.eventType)}
                <span className="ml-1 capitalize">{event.eventType}</span>
              </Badge>
              <Badge className={cn("text-xs border backdrop-blur-sm", getStatusColor(event.status, event.isPast))}>
                {event.isPast ? 'Past' : event.status}
              </Badge>
            </div>
          </div>
        )}

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
              {event.title}
            </h3>

            {/* Date & Venue */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            </div>

            {/* Price & Participants */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-semibold",
                  event.isFree ? "text-green-600" : "text-orange-600"
                )}>
                  {event.isFree ? 'Free' : `Rp ${event.price.toLocaleString()}`}
                </span>
              </div>
              {event.currentRegistrants !== undefined && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{event.currentRegistrants}</span>
                  {event.maxParticipants && (
                    <span className="text-gray-400">/{event.maxParticipants}</span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView?.(event)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(event)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(event)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Register Button */}
            {onRegister && !event.isPast && !event.isRegistrationClose && (
              <Button
                size="sm"
                onClick={() => onRegister(event)}
                className="w-full mt-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium"
              >
                Register Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {event.mainImage ? (
              <img
                src={event.mainImage.image}
                alt={event.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-400 to-pink-400 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Badge className={cn("text-xs", getEventTypeColor(event.eventType))}>
                    {event.eventType}
                  </Badge>
                  <Badge className={cn("text-xs", getStatusColor(event.status, event.isPast))}>
                    {event.isPast ? 'Past' : event.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className={cn(
                  "font-semibold text-sm",
                  event.isFree ? "text-green-600" : "text-orange-600"
                )}>
                  {event.isFree ? 'Free' : `Rp ${event.price.toLocaleString()}`}
                </span>

                {showActions && (
                  <div className="flex gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(event)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(event)}
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
          {/* Image */}
          {event.mainImage ? (
            <div className="flex-shrink-0">
              <img
                src={event.mainImage.image}
                alt={event.title}
                className="w-32 h-32 rounded-xl object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-orange-400 to-pink-400 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("text-xs", getEventTypeColor(event.eventType))}>
                    {getEventTypeIcon(event.eventType)}
                    <span className="ml-1 capitalize">{event.eventType}</span>
                  </Badge>
                  <Badge className={cn("text-xs", getStatusColor(event.status, event.isPast))}>
                    {event.isPast ? 'Past' : event.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {event.title}
                </h3>
              </div>

              {showActions && (
                <div className="flex gap-2 flex-shrink-0">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(event)}
                      className="h-9 w-9 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(event)}
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
              {event.description}
            </p>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={cn(
                  "font-semibold",
                  event.isFree ? "text-green-600" : "text-orange-600"
                )}>
                  {event.isFree ? 'Free' : `Rp ${event.price.toLocaleString()}`}
                </span>
              </div>
              {event.currentRegistrants !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{event.currentRegistrants} registered</span>
                </div>
              )}
            </div>

            {/* Organizer */}
            {showOrganizer && event.organizer && (
              <div className="flex items-center gap-2 mb-4">
                <Avatar
                  src={event.organizer.avatar}
                  name={event.organizer.name}
                  size="sm"
                />
                <span className="text-sm text-gray-600">by {event.organizer.name}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(event)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              )}
              {onRegister && !event.isPast && !event.isRegistrationClose && (
                <Button
                  size="sm"
                  onClick={() => onRegister(event)}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium"
                >
                  Register Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};