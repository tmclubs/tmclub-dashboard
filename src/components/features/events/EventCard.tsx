import React from 'react';
import { Calendar, MapPin, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, Badge, Button, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { formatEventDateTime } from '@/lib/utils/date';
import { formatEventPrice } from '@/lib/utils/money';
import { Event } from '@/types/api';
import { getBackendImageUrl } from '@/lib/utils/image';

export interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured' | 'grid';
  showActions?: boolean;
  showOrganizer?: boolean;
  onView?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onRegister?: (event: Event) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'default',
  showActions = false,
  showOrganizer = false,
  onView,
  onEdit,
  onDelete,
  onRegister,
  className,
}) => {
  const getEventTypeIcon = () => {
    // Since we don't have eventType anymore, we'll use default icon
    return <MapPin className="w-4 h-4" />;
  };

  const getEventTypeColor = (level?: string) => {
    // Map level to colors
    if (!level) return 'bg-gray-100 text-gray-800 border-gray-200';
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('beginner')) return 'bg-green-100 text-green-800 border-green-200';
    if (lowerLevel.includes('intermediate')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (lowerLevel.includes('advanced')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusColor = (isRegistrationClose: boolean, isPast?: boolean) => {
    if (isPast) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (isRegistrationClose) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const isGrid = variant === 'grid';
  const isCompact = variant === 'compact';
  const isPast = new Date(event.date) < new Date();
  const imageSrc = getBackendImageUrl(event.main_image_url);

  if (isGrid) {
    return (
      <Card className={cn("group hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden", className)}>
        {/* Image Section */}
        {imageSrc ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={imageSrc}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute top-3 left-3 flex gap-2">
              {event.level && (
                <Badge className={cn("text-xs border backdrop-blur-sm", getEventTypeColor(event.level))}>
                  {getEventTypeIcon()}
                  <span className="ml-1">{event.level}</span>
                </Badge>
              )}
              <Badge className={cn("text-xs border backdrop-blur-sm", getStatusColor(event.is_registration_close, isPast))}>
                {isPast ? 'Past' : event.is_registration_close ? 'Closed' : 'Open'}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-orange-400 to-pink-400 relative">
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute top-3 left-3 flex gap-2">
              {event.level && (
                <Badge className={cn("text-xs border backdrop-blur-sm", getEventTypeColor(event.level))}>
                  {getEventTypeIcon()}
                  <span className="ml-1">{event.level}</span>
                </Badge>
              )}
              <Badge className={cn("text-xs border backdrop-blur-sm", getStatusColor(event.is_registration_close, isPast))}>
                {isPast ? 'Past' : event.is_registration_close ? 'Closed' : 'Open'}
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
                <span className="font-medium">{formatEventDateTime(event.date)}</span>
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
                  event.is_free ? "text-green-600" : "text-orange-600"
                )}>
                  {formatEventPrice({ is_free: event.is_free, price: event.price })}
                </span>
              </div>
              {event.registrant_count !== undefined && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{event.registrant_count}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(event)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              )}
              {onRegister && !isPast && !event.is_registration_close && (
                <Button
                  size="sm"
                  onClick={() => onRegister(event)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Register
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default/Compact/Featured variants
  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-gray-200",
      isCompact ? "p-4" : "overflow-hidden",
      className
    )}>
      <div className={cn(
        "flex",
        isCompact ? "gap-4" : "flex-col md:flex-row"
      )}>
        {/* Image Section */}
        {!isCompact && (
          <div className="relative md:w-80 h-48 md:h-auto overflow-hidden">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-400" />
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              {event.level && (
                <Badge className={cn("text-xs border backdrop-blur-sm", getEventTypeColor(event.level))}>
                  {getEventTypeIcon()}
                  <span className="ml-1">{event.level}</span>
                </Badge>
              )}
              <Badge className={cn("text-xs border backdrop-blur-sm", getStatusColor(event.is_registration_close, isPast))}>
                {isPast ? 'Past' : event.is_registration_close ? 'Closed' : 'Open'}
              </Badge>
            </div>
          </div>
        )}

        {/* Content Section */}
        <CardContent className={cn(
          "flex-1",
          isCompact ? "p-0" : "p-6"
        )}>
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className={cn(
                    "font-semibold text-gray-900 group-hover:text-orange-600 transition-colors",
                    isCompact ? "text-base line-clamp-1" : "text-xl line-clamp-2"
                  )}>
                    {event.title}
                  </h3>
                  {isCompact && event.level && (
                    <Badge className={cn("text-xs flex-shrink-0", getEventTypeColor(event.level))}>
                      {event.level}
                    </Badge>
                  )}
                </div>

                {!isCompact && (
                  <p className="text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Event Details */}
              <div className={cn(
                "space-y-2 text-sm text-gray-600",
                isCompact && "space-y-1"
              )}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="font-medium">{formatEventDateTime(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className={cn(isCompact ? "line-clamp-1" : "line-clamp-2")}>
                    {event.venue}
                  </span>
                </div>
                {event.registrant_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{event.registrant_count} registered</span>
                  </div>
                )}
              </div>

              {/* Organizer */}
              {showOrganizer && event.owned_by_email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <span className="text-xs font-medium">
                      {event.owned_by_email.charAt(0).toUpperCase()}
                    </span>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {event.owned_by_email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">Organizer</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={cn(
              "flex items-center justify-between",
              isCompact ? "mt-2" : "mt-6"
            )}>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "font-semibold",
                  event.is_free ? "text-green-600" : "text-orange-600",
                  isCompact ? "text-sm" : "text-lg"
                )}>
                  {formatEventPrice({ is_free: event.is_free, price: event.price })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {showActions && (
                  <>
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
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(event)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                )}
                {onRegister && !isPast && !event.is_registration_close && (
                  <Button
                    size="sm"
                    onClick={() => onRegister(event)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Register
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};