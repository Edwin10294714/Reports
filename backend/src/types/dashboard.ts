export interface DashboardKpis {
  totalStudents: number;
  activeStudents: number;
  deferredStudents: number;
  graduatedStudents: number;
  totalStaff: number;
  totalDepartments: number;
  totalProgrammes: number;
}

export interface StudentDepartmentMetric {
  departmentName: string;
  studentCount: number;
}

export interface StudentLevelMetric {
  level: string;
  studentCount: number;
}

export interface StudentProgrammeMetric {
  programmeName: string;
  studentCount: number;
}

export interface StudentStatusMetric {
  status: string;
  studentCount: number;
}

export interface StaffDepartmentMetric {
  departmentName: string;
  staffCount: number;
}

export interface StaffTypeMetric {
  staffType: string;
  staffCount: number;
}

export interface DashboardData {
  academicYear: string;
  kpis: DashboardKpis;
  students: {
    byDepartment: StudentDepartmentMetric[];
    byLevel: StudentLevelMetric[];
    byProgramme: StudentProgrammeMetric[];
    byStatus: StudentStatusMetric[];
  };
  staff: {
    byDepartment: StaffDepartmentMetric[];
    byType: StaffTypeMetric[];
  };
}

export interface DashboardResponse {
  data: DashboardData;
}

export interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface AcademicYearsResponse {
  data: AcademicYear[];
}
