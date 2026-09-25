import type { PoolClient } from "pg";
import { pool } from "../config/database.js";
import type {
  AcademicYear,
  DashboardData,
  DashboardKpis,
  StaffDepartmentMetric,
  StaffTypeMetric,
  StudentDepartmentMetric,
  StudentLevelMetric,
  StudentProgrammeMetric,
  StudentStatusMetric,
} from "../types/dashboard.js";

interface KpiRow {
  total_students: string | number;
  active_students: string | number;
  deferred_students: string | number;
  graduated_students: string | number;
  total_staff: string | number;
  total_departments: string | number;
  total_programmes: string | number;
}

interface AcademicYearRow {
  academic_year_id: string;
  year_name: string;
  is_current: boolean;
}

interface StudentDepartmentRow {
  department_name: string;
  student_count: string | number;
}

interface StudentLevelRow {
  level: string;
  student_count: string | number;
}

interface StudentProgrammeRow {
  programme_name: string;
  student_count: string | number;
}

interface StudentStatusRow {
  student_status: string;
  student_count: string | number;
}

interface StaffDepartmentRow {
  department_name: string;
  staff_count: string | number;
}

interface StaffTypeRow {
  staff_type: string;
  staff_count: string | number;
}

type Queryable = Pick<PoolClient, "query">;

export class InvalidAcademicYearError extends Error {
  readonly code = "INVALID_ACADEMIC_YEAR";

  constructor() {
    super("The selected academic year is not available.");
    this.name = "InvalidAcademicYearError";
  }
}

function toCount(value: string | number): number {
  const count = Number(value);

  if (!Number.isFinite(count)) {
    throw new Error("Database returned a non-numeric dashboard count");
  }

  return count;
}

function toAcademicYear(row: AcademicYearRow): AcademicYear {
  return {
    id: row.academic_year_id,
    name: row.year_name,
    isCurrent: row.is_current,
  };
}

async function resolveAcademicYear(
  queryable: Queryable,
  requestedName?: string,
): Promise<AcademicYear> {
  const result = requestedName
    ? await queryable.query<AcademicYearRow>(
        `
          SELECT academic_year_id::text AS academic_year_id, year_name, is_current
          FROM university.academic_years
          WHERE year_name = $1
          LIMIT 1;
        `,
        [requestedName],
      )
    : await queryable.query<AcademicYearRow>(`
        SELECT academic_year_id::text AS academic_year_id, year_name, is_current
        FROM university.academic_years
        WHERE is_current = true
        ORDER BY start_date DESC
        LIMIT 1;
      `);

  const row = result.rows[0];

  if (!row) {
    throw new InvalidAcademicYearError();
  }

  return toAcademicYear(row);
}

export async function getAcademicYears(): Promise<AcademicYear[]> {
  const result = await pool.query<AcademicYearRow>(`
    SELECT academic_year_id::text AS academic_year_id, year_name, is_current
    FROM university.academic_years
    ORDER BY start_date DESC, academic_year_id DESC;
  `);

  return result.rows.map(toAcademicYear);
}

async function queryDashboard(
  client: PoolClient,
  academicYear: AcademicYear,
): Promise<DashboardData> {
  const kpiResult = await client.query<KpiRow>(`
    SELECT
        COUNT(*) AS total_students,
        COUNT(*) FILTER (WHERE student_status = 'Active') AS active_students,
        COUNT(*) FILTER (WHERE student_status = 'Deferred') AS deferred_students,
        COUNT(*) FILTER (WHERE student_status = 'Graduated') AS graduated_students,
        (SELECT COUNT(*) FROM university.staff) AS total_staff,
        (SELECT COUNT(*) FROM university.departments) AS total_departments,
        (SELECT COUNT(*) FROM university.programmes) AS total_programmes
    FROM university.students;
  `);

  const departmentResult = await client.query<StudentDepartmentRow>(`
    SELECT
        d.department_name,
        COUNT(DISTINCT e.student_id) AS student_count
    FROM university.enrolments e
    JOIN university.students st
        ON st.student_id = e.student_id
    JOIN university.programmes p
        ON p.programme_id = st.programme_id
    JOIN university.departments d
        ON d.department_id = p.department_id
    WHERE e.academic_year_id = $1
      AND e.enrolment_status IN ('Enrolled', 'Completed')
    GROUP BY
        d.department_id,
        d.department_code,
        d.department_name
    ORDER BY
        student_count DESC,
        d.department_code;
  `, [academicYear.id]);

  const levelResult = await client.query<StudentLevelRow>(`
    SELECT
        e.level,
        COUNT(DISTINCT e.student_id) AS student_count
    FROM university.enrolments e
    WHERE e.academic_year_id = $1
      AND e.enrolment_status IN ('Enrolled', 'Completed')
    GROUP BY
        e.level
    ORDER BY
        CASE e.level
            WHEN 'Level 100' THEN 1
            WHEN 'Level 200' THEN 2
            WHEN 'Level 300' THEN 3
            WHEN 'Level 400' THEN 4
            ELSE 5
        END;
  `, [academicYear.id]);

  const programmeResult = await client.query<StudentProgrammeRow>(`
    SELECT
        p.programme_name,
        COUNT(DISTINCT e.student_id) AS student_count
    FROM university.enrolments e
    JOIN university.students st
        ON st.student_id = e.student_id
    JOIN university.programmes p
        ON p.programme_id = st.programme_id
    WHERE e.academic_year_id = $1
      AND e.enrolment_status IN ('Enrolled', 'Completed')
    GROUP BY
        p.programme_id,
        p.programme_code,
        p.programme_name
    ORDER BY
        student_count DESC,
        p.programme_code;
  `, [academicYear.id]);

  const statusResult = await client.query<StudentStatusRow>(`
    SELECT
        st.student_status,
        COUNT(*) AS student_count
    FROM university.students st
    GROUP BY
        st.student_status
    ORDER BY
        CASE st.student_status
            WHEN 'Active' THEN 1
            WHEN 'Deferred' THEN 2
            WHEN 'Graduated' THEN 3
            ELSE 4
        END;
  `);

  const staffDepartmentResult = await client.query<StaffDepartmentRow>(`
    SELECT
        d.department_name,
        COUNT(st.staff_id) AS staff_count
    FROM university.staff st
    JOIN university.departments d
        ON d.department_id = st.department_id
    GROUP BY
        d.department_id,
        d.department_code,
        d.department_name
    ORDER BY
        staff_count DESC,
        d.department_code;
  `);

  const staffTypeResult = await client.query<StaffTypeRow>(`
    SELECT
        st.staff_type,
        COUNT(*) AS staff_count
    FROM university.staff st
    GROUP BY
        st.staff_type
    ORDER BY
        CASE st.staff_type
            WHEN 'Academic' THEN 1
            WHEN 'Administrative' THEN 2
            WHEN 'Technical' THEN 3
            ELSE 4
        END;
  `);

  const kpi = kpiResult.rows[0];

  if (!kpi) {
    throw new Error("KPI data is unavailable");
  }

  const kpis: DashboardKpis = {
    totalStudents: toCount(kpi.total_students),
    activeStudents: toCount(kpi.active_students),
    deferredStudents: toCount(kpi.deferred_students),
    graduatedStudents: toCount(kpi.graduated_students),
    totalStaff: toCount(kpi.total_staff),
    totalDepartments: toCount(kpi.total_departments),
    totalProgrammes: toCount(kpi.total_programmes),
  };

  const byDepartment: StudentDepartmentMetric[] = departmentResult.rows.map(
    (row) => ({
      departmentName: row.department_name,
      studentCount: toCount(row.student_count),
    }),
  );

  const byLevel: StudentLevelMetric[] = levelResult.rows.map((row) => ({
    level: row.level,
    studentCount: toCount(row.student_count),
  }));

  const byProgramme: StudentProgrammeMetric[] = programmeResult.rows.map(
    (row) => ({
      programmeName: row.programme_name,
      studentCount: toCount(row.student_count),
    }),
  );

  const byStatus: StudentStatusMetric[] = statusResult.rows.map((row) => ({
    status: row.student_status,
    studentCount: toCount(row.student_count),
  }));

  const staffByDepartment: StaffDepartmentMetric[] =
    staffDepartmentResult.rows.map((row) => ({
      departmentName: row.department_name,
      staffCount: toCount(row.staff_count),
    }));

  const byType: StaffTypeMetric[] = staffTypeResult.rows.map((row) => ({
    staffType: row.staff_type,
    staffCount: toCount(row.staff_count),
  }));

  return {
    academicYear: academicYear.name,
    kpis,
    students: {
      byDepartment,
      byLevel,
      byProgramme,
      byStatus,
    },
    staff: {
      byDepartment: staffByDepartment,
      byType,
    },
  };
}

export async function getDashboardData(
  requestedAcademicYear?: string,
): Promise<DashboardData> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const academicYear = await resolveAcademicYear(
      client,
      requestedAcademicYear,
    );
    const dashboard = await queryDashboard(client, academicYear);
    await client.query("COMMIT");
    return dashboard;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function validateAcademicYear(
  requestedAcademicYear?: string,
): Promise<AcademicYear> {
  return resolveAcademicYear(pool, requestedAcademicYear);
}
