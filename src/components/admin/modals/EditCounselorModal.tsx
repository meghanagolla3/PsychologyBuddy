"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { X, Edit, Check, Eye, EyeOff, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SchoolSearch } from '@/src/components/admin/modals/SchoolSearch';
import { LocationSearch } from '@/src/components/admin/modals/LocationSearch';
import { useAdminLoading, AdminActions } from '@/src/contexts/AdminLoadingContext';
import { LoadingButton } from '@/src/components/admin/ui/AdminLoader';
import { useToast } from '@/components/ui/use-toast';
import { Counselor } from '@/src/types/counselor.types';

interface EditCounselorModalProps {
  counselor: Counselor;
  onClose: () => void;
  onSuccess: () => void;
  schools: any[];
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  schoolId: string;
  locationId: string;
  qualifications?: string;
  specialization?: string;
  licenseNumber?: string;
  experience?: string;
  bio?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  status?: string;
  schoolId?: string;
  locationId?: string;
}

interface SchoolLocation {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  isMain: boolean;
  school: {
    name: string;
  };
  _count: {
    users: number;
    classes: number;
  };
}

export function EditCounselorModal({ counselor, onClose, onSuccess, schools }: EditCounselorModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { executeWithLoading } = useAdminLoading();

  const [formData, setFormData] = useState<FormData>({
    firstName: counselor.firstName,
    lastName: counselor.lastName,
    email: counselor.email,
    phone: counselor.phone || '',
    department: counselor.adminProfile?.department || 'Counseling',
    status: counselor.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    schoolId: counselor.schoolId || user?.school?.id || '',
    locationId: counselor.locationId || '',
    qualifications: counselor.adminProfile?.qualifications || '',
    specialization: counselor.adminProfile?.specialization || '',
    licenseNumber: counselor.adminProfile?.licenseNumber || '',
    experience: counselor.adminProfile?.experience || '',
    bio: counselor.adminProfile?.bio || ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', color: 'text-green-600' },
    { value: 'INACTIVE', label: 'Inactive', color: 'text-gray-600' },
    { value: 'SUSPENDED', label: 'Suspended', color: 'text-red-600' }
  ];

  // Validate phone number
  const validatePhone = async (phone: string) => {
    if (!phone) {
      setPhoneError("");
      return;
    }

    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Invalid phone number format");
      return;
    }

    setIsCheckingPhone(true);
    try {
      const response = await fetch(`/api/auth/check-phone?phone=${encodeURIComponent(phone)}&excludeId=${counselor.id}`);
      const data = await response.json();
      if (data.exists) {
        setPhoneError("Phone number already exists");
      } else {
        setPhoneError("");
      }
    } catch (error) {
      console.error("Error checking phone:", error);
      setPhoneError("");
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // Validate email
  const validateEmail = async (email: string) => {
    if (!email) {
      setEmailError("");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return;
    }

    setIsCheckingEmail(true);
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}&excludeId=${counselor.id}`);
      const data = await response.json();
      if (data.exists) {
        setEmailError("Email already exists");
      } else {
        setEmailError("");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailError("");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
    setSubmitError('');

    // Validate phone and email in real-time
    if (field === 'phone') {
      validatePhone(value);
    } else if (field === 'email') {
      validateEmail(value);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (emailError) {
      newErrors.email = emailError;
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.schoolId) {
      newErrors.schoolId = 'School is required';
    }

    if (phoneError) {
      newErrors.phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await executeWithLoading(
        AdminActions.UPDATE_ADMIN,
        async () => {
          const response = await fetch(`/api/counselors/${counselor.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (data.success) {
            toast({
              title: "Counselor updated successfully",
              description: `${formData.firstName} ${formData.lastName}'s information has been updated.`,
            });
            onSuccess();
          } else {
            setSubmitError(data.message || 'Failed to update counselor');
          }
        },
        'Updating counselor...'
      );
    } catch (error) {
      console.error('Error updating counselor:', error);
      setSubmitError('Network error. Please try again.');
    }
  };

  const selectedSchool = schools.find(s => s.id === formData.schoolId);
  const selectedStatus = statusOptions.find(s => s.value === formData.status);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Counselor
          </DialogTitle>
          <DialogDescription>
            Update counselor information and professional details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="counselor@school.edu"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              {isCheckingEmail && (
                <p className="text-gray-500 text-sm mt-1">Checking email...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
              {isCheckingPhone && (
                <p className="text-gray-500 text-sm mt-1">Checking phone...</p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <Input
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Counseling, Student Services"
                className={errors.department ? 'border-red-500' : ''}
              />
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualifications
              </label>
              <Textarea
                value={formData.qualifications}
                onChange={(e) => handleInputChange('qualifications', e.target.value)}
                placeholder="e.g., M.A. in Counseling, Licensed Professional Counselor"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <Input
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                placeholder="e.g., Adolescent Counseling, Trauma Therapy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <Input
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Professional license number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience
              </label>
              <Textarea
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="Years of experience and relevant background"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Brief professional biography"
                rows={3}
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Assignment</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School *
              </label>
              {user?.role?.name === 'SUPERADMIN' ? (
                <SchoolSearch
                  selectedSchool={selectedSchool}
                  onSchoolSelect={(school) => handleInputChange('schoolId', school?.id || '')}
                  error={errors.schoolId}
                />
              ) : (
                <div className="p-3 bg-gray-50 border rounded-md">
                  <p className="text-sm font-medium">{user?.school?.name}</p>
                  <p className="text-xs text-gray-500">Assigned to your school</p>
                </div>
              )}
              {errors.schoolId && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <LocationSearch
                schoolId={formData.schoolId}
                selectedLocation={counselor.location}
                onLocationSelect={(location) => handleInputChange('locationId', location?.id || '')}
                error={errors.locationId}
              />
              {errors.locationId && (
                <p className="text-red-500 text-sm mt-1">{errors.locationId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <Popover open={isStatusPopoverOpen} onOpenChange={setIsStatusPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    <span className={selectedStatus?.color}>
                      {selectedStatus?.label || 'Select status'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => {
                        handleInputChange('status', status.value);
                        setIsStatusPopoverOpen(false);
                      }}
                    >
                      <span className={status.color}>{status.label}</span>
                      {formData.status === status.value && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          </div>

          {/* Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loadingText="Updating..."
            >
              Update Counselor
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
