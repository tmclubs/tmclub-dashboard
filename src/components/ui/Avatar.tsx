import React from 'react';
import { User, Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getBackendImageUrl } from '@/lib/utils/image';
import { LazyImage } from '@/components/common/LazyImage';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  name?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  editable?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({
    className,
    src,
    alt,
    size = 'md',
    shape = 'circle',
    name,
    status,
    editable = false,
    onEdit,
    onRemove,
    ...props
  }, ref) => {
    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    };

    const statusSizeClasses = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    };

    const getRandomColor = (name: string) => {
      const colors = [
        'bg-orange-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
      ];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };

    const renderAvatar = () => {
      const imageUrl = getBackendImageUrl(src);
      
      const fallbackContent = (
        <div
          className={cn(
            'h-full w-full flex items-center justify-center text-white font-medium',
            shape === 'circle' ? 'rounded-full' : 'rounded-md',
            name && getRandomColor(name)
          )}
        >
          {name ? getInitials(name) : <User className="h-1/2 w-1/2" />}
        </div>
      );

      if (imageUrl) {
        return (
          <LazyImage
            src={imageUrl}
            alt={alt || name || 'Avatar'}
            className={cn(
              'h-full w-full object-cover',
              shape === 'circle' ? 'rounded-full' : 'rounded-md'
            )}
            fallback={fallbackContent}
            containerClassName="w-full h-full"
          />
        );
      }

      return fallbackContent;
    };

    return (
      <div className="relative inline-block" ref={ref} {...props}>
        <div
          className={cn(
            'relative overflow-hidden bg-gray-200 flex-shrink-0',
            sizeClasses[size],
            className
          )}
        >
          {renderAvatar()}

          {/* Edit Overlay */}
          {editable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Status Indicator */}
        {status && (
          <div
            className={cn(
              'absolute bottom-0 right-0 border-2 border-white rounded-full',
              statusSizeClasses[size],
              {
                'bg-green-500': status === 'online',
                'bg-gray-400': status === 'offline',
                'bg-yellow-500': status === 'away',
                'bg-red-500': status === 'busy',
              }
            )}
          />
        )}

        {/* Remove Button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Edit Button */}
        {editable && onEdit && (
          <button
            onClick={onEdit}
            className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-1 hover:bg-orange-600 transition-colors"
          >
            <Camera className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: AvatarProps['size'];
  shape?: AvatarProps['shape'];
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 5,
  size = 'sm',
  shape = 'circle',
  className,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          name={avatar.name}
          size={size}
          shape={shape}
          className="border-2 border-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center bg-gray-200 text-gray-600 font-medium border-2 border-white',
            {
              'h-6 w-6 text-xs': size === 'xs',
              'h-8 w-8 text-sm': size === 'sm',
              'h-10 w-10 text-base': size === 'md',
              'h-12 w-12 text-lg': size === 'lg',
              'h-16 w-16 text-xl': size === 'xl',
            },
            shape === 'circle' ? 'rounded-full' : 'rounded-md'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};