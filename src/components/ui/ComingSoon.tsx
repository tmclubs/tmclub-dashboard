import React from 'react';
import { Clock, Rocket, Star, Zap } from 'lucide-react';

export interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  estimatedDate?: string;
  features?: string[];
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = "Fitur ini sedang dalam pengembangan dan akan segera hadir!",
  icon,
  estimatedDate,
  features = []
}) => {
  const defaultIcon = <Rocket className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Animated Background Elements - Hidden on mobile to prevent overlay issues */}
        <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Icon with Animation */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="relative">
              <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-4 sm:p-6 shadow-lg">
                {icon || defaultIcon}
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 px-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* Subtitle */}
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
            <span className="text-base sm:text-lg text-gray-600 font-medium">Coming Soon</span>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
            {description}
          </p>

          {/* Estimated Date */}
          {estimatedDate && (
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 sm:px-4 sm:py-2 rounded-full border border-blue-200 text-sm sm:text-base">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="font-medium">Estimasi: {estimatedDate}</span>
              </div>
            </div>
          )}

          {/* Features Preview */}
          {features.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center justify-center gap-2 px-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                <span>Fitur yang Akan Datang</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-lg mx-auto px-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-200 text-left"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="space-y-3 sm:space-y-4 px-2">
            <p className="text-sm sm:text-base text-gray-500">
              Pantau terus perkembangan fitur ini!
            </p>
            
            {/* Progress Bar Animation */}
            <div className="max-w-xs mx-auto">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Development Progress: 75%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;