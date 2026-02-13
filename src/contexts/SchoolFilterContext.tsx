"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface School {
  id: string;
  name: string;
  location?: string;
  studentCount?: number;
  alertCount?: number;
  checkInsToday?: number;
  address?: string;
  phone?: string;
  email?: string;
  _count?: {
    users: number;
    classes: number;
  };
}

interface SchoolFilterContextType {
  selectedSchoolId: string;
  setSelectedSchoolId: (id: string) => void;
  schools: School[];
  setSchools: (schools: School[]) => void;
  isSuperAdmin: boolean;
  setIsSuperAdmin: (isSuperAdmin: boolean) => void;
}

const SchoolFilterContext = createContext<SchoolFilterContextType | undefined>(undefined);

export function SchoolFilterProvider({ children }: { children: ReactNode }) {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('all');
  const [schools, setSchools] = useState<School[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  console.log('SchoolFilterContext state:', { selectedSchoolId, schoolsCount: schools.length, isSuperAdmin });

  return (
    <SchoolFilterContext.Provider
      value={{
        selectedSchoolId,
        setSelectedSchoolId,
        schools,
        setSchools,
        isSuperAdmin,
        setIsSuperAdmin,
      }}
    >
      {children}
    </SchoolFilterContext.Provider>
  );
}

export function useSchoolFilter() {
  const context = useContext(SchoolFilterContext);
  if (context === undefined) {
    throw new Error('useSchoolFilter must be used within a SchoolFilterProvider');
  }
  return context;
}
