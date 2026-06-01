"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from '@/src/contexts/AuthContext';
import { X, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/src/components/admin/ui/AdminLoader";
import { SchoolSearch } from '@/src/components/admin/modals/SchoolSearch';

interface AddParentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  studentId: string;
  schoolId: string;
  status: "ACTIVE" | "INACTIVE";
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  schoolId?: string;
  studentId?: string;
}

export function AddParentModal({ onClose, onSuccess }: AddParentModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    studentId: "",
    schoolId: (user?.school?.id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(user.school.id)) ? user.school.id : '',
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();

  // Filter students based on search
  const filteredStudents = students.filter((student) => {
    const searchLower = studentSearch.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.studentId?.toLowerCase().includes(searchLower) ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchLower)
    );
  });

  // Fetch students when schoolId changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (formData.schoolId) {
        try {
          const response = await fetch(`/api/students?schoolId=${formData.schoolId}`, { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setStudents(data.data?.students || data.data || []);
            }
          }
        } catch (error) {
          console.error('Failed to fetch students:', error);
          setStudents([]);
        }
      } else {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [formData.schoolId]);

  const validatePhone = (phone: string): { isValid: boolean; message: string } => {
    if (!phone || phone.trim() === '') {
      return { isValid: false, message: 'Mobile number is required' };
    }
    
    // Remove all non-numeric characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if exactly 10 digits
    if (cleanPhone.length !== 10) {
      if (cleanPhone.length < 10) {
        return { isValid: false, message: `Please enter ${10 - cleanPhone.length} more digit${10 - cleanPhone.length > 1 ? 's' : ''}` };
      } else {
        return { isValid: false, message: 'Mobile number must be exactly 10 digits' };
      }
    }
    
    // Check if contains only numbers (after cleaning)
    if (!/^\d{10}$/.test(cleanPhone)) {
      return { isValid: false, message: 'Only numbers are allowed' };
    }
    
    return { isValid: true, message: '' };
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'phone') {
      // Remove all non-numeric characters
      let processedValue = value.replace(/\D/g, '');

      // Limit to 10 digits
      processedValue = processedValue.slice(0, 10);

      // Real-time validation for phone number
      const phoneValidation = validatePhone(processedValue);
      if (!phoneValidation.isValid && processedValue.length > 0) {
        setPhoneError(phoneValidation.message);
      } else {
        setPhoneError('');
      }

      setFormData((prev) => ({ ...prev, [field]: processedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    const errorField = field as keyof FormErrors;
    if (errors[errorField]) {
      setErrors((prev) => ({ ...prev, [errorField]: undefined }));
    }
    if (submitError) setSubmitError("");
  };

  const handleSchoolSelect = (school: any) => {
    if (school) {
      setFormData((prev) => ({ ...prev, schoolId: school.id, studentId: '' }));
      setSelectedSchool(school);
      if (errors.schoolId) {
        setErrors((prev) => ({ ...prev, schoolId: undefined }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    // Phone validation
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.message;
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.schoolId) {
      newErrors.schoolId = "School is required";
    }
    if (!formData.studentId) {
      newErrors.studentId = "Student is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setSubmitError(data.message || data.error || "Failed to create parent");
      }
    } catch (error: any) {
      setSubmitError("Failed to create parent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-w-xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Parent
          </DialogTitle>
          <DialogDescription>
            Create a new parent account and link their child.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="10-digit phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Min 8 characters (auto-generated if empty)"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School *
              </label>
              <SchoolSearch
                initialSchool={selectedSchool}
                onSchoolSelect={handleSchoolSelect}
              />
              {errors.schoolId && (
                <p className="mt-1 text-xs text-red-600">{errors.schoolId}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Child Information</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student *
              </label>
              <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    disabled={!formData.schoolId || students.length === 0}
                  >
                    {formData.studentId ? (
                      students.find(s => s.id === formData.studentId)?.studentId || 'Selected student'
                    ) : (
                      'Search student by name or ID...'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Search student..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="px-3 py-2 hover:bg-muted cursor-pointer rounded text-sm"
                          onClick={() => {
                            handleInputChange("studentId", student.id);
                            setStudentSearch('');
                            setIsDropdownOpen(false);
                          }}
                        >
                          <div className="font-medium">{student.firstName} {student.lastName}</div>
                          <div className="text-xs text-muted-foreground">{student.studentId}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {studentSearch ? "No students found" : "No students available"}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {formData.studentId && (
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange("studentId", '');
                    setStudentSearch('');
                  }}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  Clear selection
                </button>
              )}
              {errors.studentId && (
                <p className="mt-1 text-xs text-red-600">{errors.studentId}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <LoadingButton type="submit" isLoading={isSubmitting} loadingText="Creating...">
              Create Parent
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

