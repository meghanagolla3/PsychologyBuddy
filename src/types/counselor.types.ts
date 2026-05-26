export interface Counselor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  schoolId?: string;
  locationId?: string;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  role: {
    id: string;
    name: string;
    description?: string;
  };
  
  school?: {
    id: string;
    name: string;
    email?: string;
  };
  
  location?: {
    id: string;
    name: string;
    address?: string;
  };
  
  adminProfile?: {
    id: string;
    userId: string;
    department: string;
    profileImageUrl?: string;
    bio?: string;
    qualifications?: string;
    specialization?: string;
    licenseNumber?: string;
    experience?: string;
  };
  
  // Counselor specific data
  assignedStudents?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    status: string;
  }>;
  
  activeEscalations?: Array<{
    id: string;
    studentId: string;
    studentName: string;
    level: string;
    category: string;
    createdAt: string;
  }>;
  
  scheduledSessions?: Array<{
    id: string;
    studentId: string;
    studentName: string;
    scheduledAt: string;
    status: string;
  }>;

  // Session statistics
  sessionStats?: {
    todayCounsels: number;
    totalCounsels: number;
    declinedCounsels: number;
  };
}

export interface CreateCounselorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  schoolId: string;
  locationId?: string;
  department: string;
  qualifications?: string;
  specialization?: string;
  licenseNumber?: string;
  experience?: string;
  bio?: string;
}

export interface UpdateCounselorRequest extends Partial<CreateCounselorRequest> {
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface CounselorFilters {
  schoolId?: string;
  locationId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CounselorApiResponse {
  success: boolean;
  data: {
    counselors: Counselor[];
    pagination: {
      total: number;
      totalPages: number;
      page: number;
      limit: number;
    };
  };
  message?: string;
}
