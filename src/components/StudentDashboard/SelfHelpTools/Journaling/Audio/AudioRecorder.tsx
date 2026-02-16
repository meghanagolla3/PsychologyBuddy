'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number, title?: string) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current date in the format shown in design
  const getCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setRecordedBlob(audioBlob);
        
        // Check if recording is too short
        if (duration < 2) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3000);
        }
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Ensure we have at least 1 second of recording
      if (duration === 0) {
        setDuration(1); // Set minimum duration to 1 second
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
      }
      setIsPaused(!isPaused);
    }
  };

  const startTimer = () => {
    // Start with 1 second immediately to avoid 0 duration
    setDuration(1);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playPauseAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
    }
    setDuration(0);
    setIsPlaying(false);
    setTitle('');
    setRecordedBlob(null);
    setShowWarning(false);
  };

  const saveRecording = () => {
    if (recordedBlob && duration >= 2) {
      onRecordingComplete(recordedBlob, duration, title.trim() || undefined);
      resetRecording();
    }
  };

  const discardRecording = () => {
    resetRecording();
  };

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div>
        <input
          type="text"
          placeholder="Give your entry a title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          disabled={isRecording}
        />
      </div>

      {/* Today's Entry Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="text-center space-y-6">
          {/* Date */}
          <div className="text-slate-600 font-medium">
            {getCurrentDate()}
          </div>

          {/* Recording Animation and Timer */}
          <div className="relative">
            {/* Circular Animation */}
            <div className="relative inline-flex items-center justify-center">
              {isRecording && (
                <div className="absolute inset-0 w-32 h-32 bg-cyan-100 rounded-full animate-ping opacity-20"></div>
              )}
              {isRecording && (
                <div className="absolute inset-0 w-32 h-32 bg-cyan-200 rounded-full animate-pulse opacity-30"></div>
              )}
              <div className="relative w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Mic className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="text-4xl font-bold text-slate-900">
            {formatTime(duration)}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-medium">
                {isPaused ? 'Recording Paused' : 'Recording...'}
              </span>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <>
                <button
                  onClick={pauseRecording}
                  className="px-8 py-3 border border-cyan-500 text-cyan-500 rounded-xl font-medium transition-colors hover:bg-cyan-50 flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={stopRecording}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Privacy Indicator */}
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <span>This recording is private</span>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
          </div>

          {/* Warning Message */}
          {showWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-yellow-800 text-sm">
              Recording is too short. Please record for at least 2 seconds.
            </div>
          )}

          {/* Audio Playback */}
          {audioURL && !isRecording && (
            <div className="pt-4 border-t border-slate-100">
              <div className="space-y-4">
                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={playPauseAudio}
                    className="w-12 h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full flex items-center justify-center transition-all"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3">
                  {duration >= 2 ? (
                    <>
                      <button
                        onClick={saveRecording}
                        className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors"
                      >
                        Save Recording
                      </button>
                      <button
                        onClick={discardRecording}
                        className="px-6 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                      >
                        Discard
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={discardRecording}
                      className="px-6 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                    >
                      Record New
                    </button>
                  )}
                </div>
              </div>
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
