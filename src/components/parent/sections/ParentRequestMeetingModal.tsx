'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui';

interface ParentRequestMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMeetingCreated?: (meeting: any) => void;
}

interface Child {
  id: string;
  name: string;
  email: string;
  classGrade?: string;
  level?: string;
}

export function ParentRequestMeetingModal({ open, onOpenChange, onMeetingCreated }: ParentRequestMeetingModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    purpose: '',
    level: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    // Fetch parent's children when modal opens
    if (open) {
      fetchChildren();
    }
  }, [open]);

  const fetchChildren = async () => {
    try {
      // Extract unique children from existing meetings
      const response = await fetch('/api/parent/meetings-test');
      const result = await response.json();
      
      if (result.success) {
        const uniqueChildren = result.data.reduce((acc: Child[], meeting: any) => {
          // Check if we already have this child
          if (!acc.find(child => child.id === meeting.studentId)) {
            acc.push({
              id: meeting.studentId,
              name: meeting.studentName,
              email: meeting.studentEmail,
              classGrade: meeting.studentClassGrade || 'medium',
              level: meeting.level || 'medium'
            });
          }
          return acc;
        }, []);
        setChildren(uniqueChildren);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started with data:', formData);
    console.log('Available children:', children);
    
    if (!formData.date || !formData.time || !formData.purpose) {
      console.error('Form validation failed - missing fields');
      return;
    }

    try {
      setLoading(true);
      
      // Create meeting requests for all children
      console.log('Creating requests for children:', children.map(c => ({ id: c.id, name: c.name })));
      console.log('Form data being sent:', formData);
      
      const requests = children.map(child => {
        const requestBody = {
          studentId: child.id,
          date: formData.date,
          time: formData.time,
          purpose: formData.purpose,
          level: formData.level,
        };
        console.log('Request body for child:', child.id, requestBody);
        
        return fetch('/api/parent/meetings/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      });

      const responses = await Promise.all(requests);
      const results = await Promise.all(responses.map(r => r.json()));
      
      console.log('Meeting requests submitted:', results);
      console.log('API response statuses:', responses.map(r => ({ status: r.status, ok: r.ok })));
      
      // Check if any requests failed
      const failedRequests = results.filter(r => !r.success);
      if (failedRequests.length > 0) {
        console.error('Some meeting requests failed:', failedRequests);
        console.error('Failed request details:', JSON.stringify(failedRequests, null, 2));
        console.error('Total requests:', requests.length);
        console.error('Successful requests:', results.filter(r => r.success).length);
      }
      
      onMeetingCreated?.(results);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        date: '',
        time: '',
        purpose: '',
        level: 'medium'
      });
    } catch (error) {
      console.error('Error submitting meeting request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-gray-900">Request Meeting</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Students Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Children
            </label>
            <div className="space-y-2">
              {children.map((child, index) => (
                <div key={child.id || index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{child.name}</p>
                      <p className="text-sm text-gray-600">{child.email}</p>
                    </div>
                  </div>
                </div>
              ))}
              {children.length === 0 && (
                <p className="text-sm text-gray-500">No children found</p>
              )}
            </div>
          </div>

          {/* Class and Level in same row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <Input
                type="text"
                value={children[0]?.classGrade || ''}
                readOnly
                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm"
                placeholder="Class"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <Input
                type="text"
                value={children[0]?.level || 'medium'}
                readOnly
                className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm"
                placeholder="Level"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <Textarea
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the purpose of this meeting..."
              required
            />
          </div>

          {/* Priority Level */}
          
        </div>

        {/* Error Message */}
        {!formData.date && !formData.time && !formData.purpose && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Please fill in all required fields before submitting.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.date || !formData.time || !formData.purpose}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-white"></div>
                <span className="ml-2">Submitting...</span>
              </div>
            ) : (
              'Submit Request'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
