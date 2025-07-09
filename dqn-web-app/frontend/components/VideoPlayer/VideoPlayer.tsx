import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoInfo } from '@/types';
import { apiClient } from '@/lib/api';
import { Play, Download, RefreshCw } from 'lucide-react';

export function VideoPlayer() {
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const videoList = await apiClient.listVideos();
      setVideos(videoList);

      // Auto-select the first video if available
      if (videoList.length > 0 && !selectedVideo) {
        setSelectedVideo(videoList[0].filename);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleDownloadVideo = (filename: string) => {
    const url = apiClient.getVideoUrl(filename);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Agent Demonstration
          <Button
            onClick={loadVideos}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Watch your trained agent playing CartPole
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Video Selection */}
          {videos.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Available Videos</label>
              <select
                value={selectedVideo || ''}
                onChange={(e) => setSelectedVideo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a video</option>
                {videos.map((video) => (
                  <option key={video.filename} value={video.filename}>
                    {video.filename} ({(video.size / 1024 / 1024).toFixed(1)} MB)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video Player */}
          {selectedVideo ? (
            <div className="space-y-3">
              <video
                key={selectedVideo} // Force re-render when video changes
                controls
                className="w-full rounded-lg shadow-sm"
                style={{ maxHeight: '400px' }}
              >
                <source src={apiClient.getVideoUrl(selectedVideo)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Playing: {selectedVideo}
                </div>
                <Button
                  onClick={() => handleDownloadVideo(selectedVideo)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {videos.length === 0 ? (
                <div>
                  <Play className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No videos available yet.</p>
                  <p className="text-sm">Train an agent and generate a video to see it here.</p>
                </div>
              ) : (
                <p>Select a video to play</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
