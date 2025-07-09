
'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';

interface VideoPlayerProps {
  videoUrl?: string;
  isLoading?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, isLoading = false }) => {
  return (
    <Card title="Agent Performance">
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Generating video...</p>
          </div>
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            className="w-full h-full rounded-lg"
            autoPlay
            loop
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🎥</div>
            <p>Test your agent to see performance video</p>
          </div>
        )}
      </div>
    </Card>
  );
};
