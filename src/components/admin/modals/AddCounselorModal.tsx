"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { X, UserPlus, Check, Eye, EyeOff, ChevronDown } from 'lucide-react';
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
import { useAdminLoading, AdminActions } from '@/src/contexts/AdminLoadingContext';
import { LoadingButton } from '@/src/components/admin/ui/AdminLoader';
import { useToast } from '@/components/ui/use-toast';

interface AddCounselorModalProps {
  onClose: () => void;
  onSuccess: () => void;
  schools: any[];
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  schoolId: string;
  locationId: string;
  specialization?: string;
  availability?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  department?: string;
  status?: string;
  schoolId?: string;
  locationId?: string;
  specialization?: string;
  availability?: string;
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

export function AddCounselorModal({ onClose, onSuccess, schools }: AddCounselorModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { executeWithLoading, isLoading } = useAdminLoading();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: 'Counseling',
    status: 'ACTIVE',
    schoolId: (user?.school?.id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(user.school.id)) ? user.school.id : '',
    locationId: '',
    specialization: '',
    availability: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  // Location state
  const [locations, setLocations] = useState<SchoolLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SchoolLocation | null>(null);

  // Status options
  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', color: 'text-green-600' },
    { value: 'INACTIVE', label: 'Inactive', color: 'text-gray-600' },
    { value: 'SUSPENDED', label: 'Suspended', color: 'text-red-600' }
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    // For regular admins, always use their school ID without strict UUID validation
    const initialSchoolId = user?.role?.name === 'SUPERADMIN' 
      ? '' 
      : (user?.school?.id || '');

    console.log('Form init - user role:', user?.role?.name, 'schoolId:', initialSchoolId);

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      department: 'Counseling',
      status: 'ACTIVE',
      schoolId: initialSchoolId,
      locationId: '',
      specialization: '',
      availability: ''
    });
    setErrors({});
    setSubmitError('');
    setPhoneError("");
    setEmailError("");
    setLocations([]);
    setSelectedLocation(null);
  }, [user?.school?.id || '', user?.role?.name || '']);

  // Memoize the effective school ID to prevent dependency array issues
  const effectiveSchoolId = formData.schoolId || (user?.role?.name !== 'SUPERADMIN' ? user?.school?.id || '' : '');

  // Fetch locations when school changes
  useEffect(() => {
    console.log('Location fetch useEffect - schoolId:', effectiveSchoolId, 'formData.schoolId:', formData.schoolId);
    
    const fetchLocations = async () => {
      if (!effectiveSchoolId) {
        console.log('No schoolId, clearing locations');
        setLocations([]);
        setSelectedLocation(null);
        return;
      }

      console.log('Fetching locations for schoolId:', effectiveSchoolId);
      try {
        const response = await fetch(`/api/admin/schools/locations?schoolId=${effectiveSchoolId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || 'admin@calmpath.ai',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Locations fetched successfully:', data);
          setLocations(data || []);
        } else {
          console.log('Failed to fetch locations, status:', response.status);
          setLocations([]);
        }
      } catch (error) {
        console.log('Error fetching locations:', error);
        setLocations([]);
      }
    };

    fetchLocations();
  }, [effectiveSchoolId, user?.id || '']);

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
      const response = await fetch(`/api/auth/check-phone?phone=${encodeURIComponent(phone)}`);
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
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
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
  const handleInputChange = (field: keyof FormData, value: string | null) => {
    console.log('handleInputChange called:', field, '=', value);
    setFormData(prev => ({ ...prev, [field]: value || '' }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setSubmitError('');

    // Validate phone and email in real-time
    if (field === 'phone') {
      validatePhone(value || '');
    } else if (field === 'email') {
      validateEmail(value || '');
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

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
        AdminActions.ADD_ADMIN,
        (async () => {
          console.log('Submitting counselor data:', formData);
          const response = await fetch('/api/counselors', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (data.success) {
            toast({
              title: "Counselor created successfully",
              description: `${formData.firstName} ${formData.lastName} has been added as a counselor.`,
            });
            onSuccess();
          } else {
            setSubmitError(data.message || 'Failed to create counselor');
          }
        })(),
        'Creating counselor...'
      );
    } catch (error) {
      console.error('Error creating counselor:', error);
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
            <UserPlus className="h-5 w-5" />
            Add New Counselor
          </DialogTitle>
          <DialogDescription>
            Create a new counselor account with their professional information
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter secure password"
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
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
                Availability
              </label>
              <Input
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                placeholder="e.g., Monday-Friday 9AM-5PM"
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Assignment</h3>
            
            {/* School Search - Show for SUPERADMIN or if user doesn't have a school */}
            {(user?.role?.name === 'SUPERADMIN' || !user?.school?.id) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School *
                </label>
                <SchoolSearch
                  onSchoolSelect={(school: any) => {
                    console.log('SchoolSearch callback - selected school:', school);
                    console.log('School object type:', typeof school);
                    console.log('School ID type:', typeof school?.id);
                    console.log('School ID value:', school?.id);
                    console.log('School ID length:', school?.id?.length);
                    
                    if (school) {
                      // Validate both UUID and school code formats before setting
                      const schoolId = school?.id || '';
                      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
                      const schoolCodeRegex = /^SCH-[A-Z]{3}-\d{6}-[A-Z0-9]{3}$/;
                      
                      console.log('Testing UUID regex against:', schoolId);
                      console.log('UUID regex test result:', uuidRegex.test(schoolId));
                      console.log('Testing school code regex against:', schoolId);
                      console.log('School code regex test result:', schoolCodeRegex.test(schoolId));
                      
                      if (uuidRegex.test(schoolId) || schoolCodeRegex.test(schoolId)) {
                        console.log('Setting valid schoolId:', schoolId);
                        handleInputChange('schoolId', schoolId);
                      } else {
                        console.log('Invalid schoolId format, not setting:', schoolId);
                        handleInputChange('schoolId', '');
                      }
                    } else {
                      console.log('Clearing schoolId');
                      handleInputChange('schoolId', '');
                    }
                  }}
                  placeholder="Search for a school..."
                />
                {errors.schoolId && (
                  <p className="mt-1 text-sm text-red-600">{errors.schoolId}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Counselors must be assigned to a specific school
                </p>
              </div>
            )}

            {/* If user has a school, show it as read-only */}
            {user?.role?.name !== 'SUPERADMIN' && user?.school?.id && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School *
                </label>
                <div className="p-3 bg-gray-50 border rounded-md">
                  <p className="text-sm font-medium">{user?.school?.name}</p>
                  <p className="text-xs text-gray-500">Assigned to your school</p>
                </div>
              </div>
            )}

            {/* Location Assignment - Only show when school is selected */}
            {(() => {
              console.log('Location field render check:');
              console.log('- formData.schoolId:', formData.schoolId);
              console.log('- user.role.name:', user?.role?.name);
              console.log('- user.school.id:', user?.school?.id);
              const condition1 = !!formData.schoolId;
              const condition2 = user?.role?.name !== 'SUPERADMIN' && !!user?.school?.id;
              console.log('- condition1 (formData.schoolId):', condition1);
              console.log('- condition2 (user.role !== SUPERADMIN && user.school.id):', condition2);
              const finalCondition = condition1 || condition2;
              console.log('- final condition:', finalCondition);
              return finalCondition;
            })() && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Assignment
                </label>
                <Popover open={isLocationPopoverOpen} onOpenChange={setIsLocationPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className={`w-full justify-between text-left font-normal ${
                        errors.locationId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {selectedLocation ? selectedLocation.name : 'Select location'}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-2 border bg-white shadow-xl rounded-[6px]" align="start">
                    <div className="p-1 max-h-60 overflow-y-auto">
                      {locations.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No locations available
                        </div>
                      ) : (
                        locations.map((location) => (
                          <div
                            key={location.id}
                            className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
                            onClick={() => {
                              setSelectedLocation(location);
                              handleInputChange('locationId', location.id);
                              setIsLocationPopoverOpen(false);
                            }}
                          >
                            <div
                              className={`h-4 w-4 border rounded-full flex items-center justify-center ${
                                formData.locationId === location.id ? "bg-blue-500 border-blue-500" : "border-gray-300"
                              }`}
                            >
                              {formData.locationId === location.id && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <span className="ml-2">{location.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.locationId && (
                  <p className="mt-1 text-sm text-red-600">{errors.locationId}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Select the specific location where this counselor will work
                </p>
              </div>
            )}

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
              isLoading={isLoading(AdminActions.ADD_ADMIN)}
              loadingText="Creating..."
            >
              Create Counselor
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

