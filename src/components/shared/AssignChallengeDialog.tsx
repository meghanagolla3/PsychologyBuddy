"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignChallengeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  challengeName?: string;
  challengeId?: string;
}

export function AssignChallengeDialog({
  open,
  onOpenChange,
  trigger,
  challengeName = "Breathing Exercises",
  challengeId,
}: AssignChallengeDialogProps) {
  const [targetType, setTargetType] = useState("individual");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const handleClose = () => onOpenChange?.(false);

  // Search students from API
  const searchStudents = useCallback(async (query: string) => {
    if (!query.trim()) {
      setStudents([]);
      setSearchError("");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      console.log('Making API call to search students...');
      const response = await fetch(`/api/students/search?q=${encodeURIComponent(query)}`);
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      setStudents(data);
      setSearchError("");
    } catch (error) {
      console.error('Error searching students:', error);
      setStudents([]);
      setSearchError(`Search failed: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStudents(studentSearch);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [studentSearch, searchStudents]);

  // Reset form when target type changes
  const handleTargetTypeChange = (type: string) => {
    setTargetType(type);
    setSelectedStudent(null);
    setStudentSearch("");
    setStudents([]);
    setSelectedClass("");
    setSelectedSection("");
    setIsSearching(false);
    setSearchError("");
    setStartDate("");
    setEndDate("");
  };

  // Auto-populate class and section when student is selected
  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setSelectedClass(student.class);
    setSelectedSection(student.section);
    setStudentSearch(student.name); // Show student name in search
    setStudents([]); // Clear search results
  };

  const handleAssign = async () => {
    if (!challengeId) {
      setSearchError("Challenge ID is required");
      return;
    }

    if (!startDate || !endDate) {
      setSearchError("Start and end dates are required");
      return;
    }

    setIsAssigning(true);
    setSearchError("");

    try {
      // Prepare assignment data
      const assignmentData: any = {
        challengeId,
        assignmentType: targetType.toUpperCase(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      };

      // Add target based on assignment type
      if (targetType === "individual") {
        if (!selectedStudent?.id) {
          setSearchError("Please select a student");
          setIsAssigning(false);
          return;
        }
        assignmentData.targetUserId = selectedStudent.id;
      } else if (targetType === "class") {
        if (!selectedClass) {
          setSearchError("Please select a class");
          setIsAssigning(false);
          return;
        }
        // For now, we'll need to get the actual class ID - this is simplified
        assignmentData.targetClassId = selectedClass; // This should be the actual class UUID
      } else if (targetType === "platform") {
        // For platform-wide assignment, we'd need the school ID
        // This is simplified - in production you'd get this from user context
        assignmentData.targetSchoolId = "school-id"; // Replace with actual school ID
      }

      console.log("Sending assignment:", assignmentData);

      const response = await fetch("/api/challenges/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Assignment failed (${response.status})`);
      }

      const result = await response.json();
      console.log("Assignment successful:", result);

      // Show success message (you could use a toast here)
      alert(`Challenge assigned successfully to ${result.userChallenges} student(s)!`);
      
      handleClose();
    } catch (error) {
      console.error("Assignment error:", error);
      setSearchError(`Assignment failed: ${error.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Challenge</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Challenge:</Label>
            <Input value={challengeName} readOnly className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>
              Target Type <span className="text-destructive">*</span>
            </Label>
            <Select value={targetType} onValueChange={handleTargetTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Student</SelectItem>
                <SelectItem value="class">Entire Class</SelectItem>
                <SelectItem value="platform">Entire Platform</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType !== "platform" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>
                  Select Class <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={selectedClass} 
                  onValueChange={setSelectedClass}
                  disabled={targetType === "individual" && selectedStudent !== null}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        {g}th Class
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {targetType === "individual" && selectedStudent && (
                  <p className="text-xs text-gray-500">Auto-populated from student selection</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>
                  Section <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={selectedSection} 
                  onValueChange={setSelectedSection}
                  disabled={targetType === "individual" && selectedStudent !== null}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((s) => (
                      <SelectItem key={s} value={s}>
                        Section - {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {targetType === "individual" && selectedStudent && (
                  <p className="text-xs text-gray-500">Auto-populated from student selection</p>
                )}
              </div>
            </div>
          )}

          {targetType === "individual" && (
            <div className="space-y-2">
              <Label>
                Search Student <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or student ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-10"
                  disabled={isSearching}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              
              {/* Error Display */}
              {searchError && (
                <div className="text-xs text-red-500 mt-1">{searchError}</div>
              )}
              
              {/* Search Results Dropdown */}
              {students.length > 0 && !isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="font-medium text-sm">{student.name}</div>
                      <div className="text-xs text-gray-500">
                        ID: {student.studentId} • 
                        {student.class ? ` Class ${student.class}-${student.section}` : ' No class assigned'}
                        {student.schoolName && ` • ${student.schoolName}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
            />
          </div>

          <div className="space-y-2">
            <Label>
              End Date <span className="text-destructive">*</span>
            </Label>
            <Input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]} // Prevent dates before start date
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1" 
              onClick={handleAssign}
              disabled={isAssigning}
            >
              {isAssigning ? "Assigning..." : "Assign"}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleClose}
              disabled={isAssigning}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
