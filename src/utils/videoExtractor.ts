export interface ExtractedFrame {
  timestamp: number; // in seconds
  timestampFormatted: string;
  dataUrl: string; // Base64 data URL
  width: number;
  height: number;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
}

/**
 * Extracts multiple representative keyframes across the duration of a video file.
 */
export async function extractVideoKeyframes(
  videoFile: File,
  frameCount: number = 4,
  maxDimension: number = 1280
): Promise<{ duration: number; frames: ExtractedFrame[] }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(videoFile);
    video.src = fileUrl;

    const cleanup = () => {
      URL.revokeObjectURL(fileUrl);
      video.remove();
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        const frames: ExtractedFrame[] = [];

        // Choose evenly spaced target timestamps, avoiding the exact first 0.1s (often black frame)
        const targetTimes: number[] = [];
        if (duration < 2) {
          targetTimes.push(duration * 0.5);
        } else {
          for (let i = 1; i <= frameCount; i++) {
            const fraction = i / (frameCount + 1);
            targetTimes.push(duration * fraction);
          }
        }

        for (const t of targetTimes) {
          const frame = await seekAndCaptureFrame(video, t, maxDimension);
          frames.push(frame);
        }

        cleanup();
        resolve({ duration, frames });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = (e) => {
      cleanup();
      reject(new Error('Failed to load video file. Please ensure it is a supported video format (MP4, WebM, MOV).'));
    };
  });
}

/**
 * Captures a single frame at a specific timestamp from an active video element.
 */
export async function captureCurrentFrame(
  video: HTMLVideoElement,
  maxDimension: number = 1280
): Promise<ExtractedFrame> {
  const canvas = document.createElement('canvas');
  let width = video.videoWidth || 640;
  let height = video.videoHeight || 360;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');

  ctx.drawImage(video, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

  return {
    timestamp: video.currentTime,
    timestampFormatted: formatTime(video.currentTime),
    dataUrl,
    width,
    height,
  };
}

function seekAndCaptureFrame(
  video: HTMLVideoElement,
  targetTime: number,
  maxDimension: number
): Promise<ExtractedFrame> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      try {
        const canvas = document.createElement('canvas');
        let width = video.videoWidth || 640;
        let height = video.videoHeight || 360;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context error'));
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        resolve({
          timestamp: targetTime,
          timestampFormatted: formatTime(targetTime),
          dataUrl,
          width,
          height,
        });
      } catch (err) {
        reject(err);
      }
    };

    video.addEventListener('seeked', onSeeked);
    video.currentTime = targetTime;
  });
}
