"use client";

import React from 'react';
import { X, Eye, Mail, Phone, MapPin, Building, Calendar, Award, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Counselor } from '@/src/types/counselor.types';
import { formatRelativeTime } from '@/src/utils/date.util';
import { cn } from '@/lib/utils';

interface ViewCounselorModalProps {
  counselor: Counselor;
  onClose: () => void;
}

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  "COUNSELOR": { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]", label: "Counselor" },
  "DEFAULT": { bg: "bg-gray-100", text: "text-gray-600", label: "Unknown Role" },
};

export function ViewCounselorModal({ counselor, onClose }: ViewCounselorModalProps) {
  const roleStyle = ROLE_STYLES[counselor.role.name] || ROLE_STYLES.DEFAULT;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Counselor Details
          </DialogTitle>
          <DialogDescription>
            View comprehensive information about this counselor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={counselor.adminProfile?.profileImageUrl || ''}
                alt={`${counselor.firstName} ${counselor.lastName}`}
              />
              <AvatarFallback className="bg-purple-500/10 text-purple-500 text-lg">
                {counselor.firstName[0]}{counselor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {counselor.firstName} {counselor.lastName}
                </h2>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", roleStyle.bg, roleStyle.text)}
                >
                  {roleStyle.label}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{counselor.email}</span>
                </div>
                
                {counselor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{counselor.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{counselor.school?.name || 'No school assigned'}</span>
                </div>
                
                {counselor.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{counselor.location.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    counselor.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"
                  )}
                />
                <span className="text-sm font-medium capitalize">
                  {counselor.status.toLowerCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Last active: {counselor.lastActive ? formatRelativeTime(counselor.lastActive) : "Never"}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Professional Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <p className="text-sm text-gray-900">
                  {counselor.adminProfile?.department || 'Not specified'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <p className="text-sm text-gray-900">
                  {counselor.adminProfile?.licenseNumber || 'Not specified'}
                </p>
              </div>
            </div>

            {counselor.adminProfile?.qualifications && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {counselor.adminProfile.qualifications}
                </p>
              </div>
            )}

            {counselor.adminProfile?.specialization && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {counselor.adminProfile.specialization}
                </p>
              </div>
            )}

            {counselor.adminProfile?.experience && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {counselor.adminProfile.experience}
                </p>
              </div>
            )}

            {counselor.adminProfile?.bio && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {counselor.adminProfile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Assignment Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Assignment Overview
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {counselor.assignedStudents?.length || 0}
                </div>
                <div className="text-sm text-blue-700">Assigned Students</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {counselor.activeEscalations?.length || 0}
                </div>
                <div className="text-sm text-orange-700">Active Escalations</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {counselor.scheduledSessions?.length || 0}
                </div>
                <div className="text-sm text-green-700">Scheduled Sessions</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {((counselor.assignedStudents?.length || 0) || (counselor.activeEscalations?.length || 0) || (counselor.scheduledSessions?.length || 0)) > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {counselor.activeEscalations?.slice(0, 3).map((escalation) => (
                  <div key={escalation.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        {escalation.studentName}
                      </p>
                      <p className="text-xs text-red-700">
                        {escalation.level} • {escalation.category}
                      </p>
                    </div>
                    <div className="text-xs text-red-600">
                      {formatRelativeTime(escalation.createdAt)}
                    </div>
                  </div>
                ))}
                
                {counselor.scheduledSessions?.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {session.studentName}
                      </p>
                      <p className="text-xs text-green-700">
                        Counseling Session
                      </p>
                    </div>
                    <div className="text-xs text-green-600">
                      {formatRelativeTime(session.scheduledAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                  {counselor.id}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role ID</label>
                <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                  {counselor.role.id}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-sm text-gray-900">
                  {formatRelativeTime(counselor.createdAt)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">
                  {formatRelativeTime(counselor.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
