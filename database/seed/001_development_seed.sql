-- Synthetic development seed for the university reporting schema.
-- Fresh-database initialization only. Do not run against an existing database.

SET search_path = university, public;

INSERT INTO academic_years
    (academic_year_id, year_name, start_date, end_date, is_current, created_at)
VALUES
    (1, '2024/2025', DATE '2024-08-01', DATE '2025-07-31', false, TIMESTAMPTZ '2024-07-01 00:00:00+00'),
    (2, '2025/2026', DATE '2025-08-01', DATE '2026-07-31', false, TIMESTAMPTZ '2025-07-01 00:00:00+00'),
    (3, '2026/2027', DATE '2026-08-01', DATE '2027-07-31', true, TIMESTAMPTZ '2026-07-01 00:00:00+00');

INSERT INTO semesters
    (semester_id, academic_year_id, semester_name, start_date, end_date, created_at)
VALUES
    (1, 1, 'First Semester', DATE '2024-08-01', DATE '2024-12-31', TIMESTAMPTZ '2024-07-01 00:00:00+00'),
    (2, 1, 'Second Semester', DATE '2025-01-01', DATE '2025-07-31', TIMESTAMPTZ '2024-07-01 00:00:00+00'),
    (3, 2, 'First Semester', DATE '2025-08-01', DATE '2025-12-31', TIMESTAMPTZ '2025-07-01 00:00:00+00'),
    (4, 2, 'Second Semester', DATE '2026-01-01', DATE '2026-07-31', TIMESTAMPTZ '2025-07-01 00:00:00+00'),
    (5, 3, 'First Semester', DATE '2026-08-01', DATE '2026-12-31', TIMESTAMPTZ '2026-07-01 00:00:00+00'),
    (6, 3, 'Second Semester', DATE '2027-01-01', DATE '2027-07-31', TIMESTAMPTZ '2026-07-01 00:00:00+00');

INSERT INTO departments
    (department_id, department_code, department_name, created_at)
VALUES
    (1, 'BUS', 'Department of Business Administration', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (2, 'CS', 'Department of Computer Science', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (3, 'ECON', 'Department of Economics', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (4, 'MATH', 'Department of Mathematics', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (5, 'PHYS', 'Department of Physics', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (6, 'PSY', 'Department of Psychology', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (7, 'SOC', 'Department of Sociology', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (8, 'STAT', 'Department of Statistics and Actuarial Science', TIMESTAMPTZ '2024-01-01 00:00:00+00');

INSERT INTO programmes
    (programme_id, department_id, programme_code, programme_name, award_type, duration_years, is_active, created_at)
VALUES
    (1, 2, 'BSC-CS', 'BSc Computer Science', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (2, 2, 'BSC-IT', 'BSc Information Technology', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (3, 2, 'MSC-CS', 'MSc Computer Science', 'Master', 2.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (4, 8, 'BSC-ACT', 'BSc Actuarial Science', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (5, 8, 'BSC-STAT', 'BSc Statistics', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (6, 8, 'MSC-STAT', 'MSc Statistics', 'Master', 2.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (7, 3, 'BA-ECON', 'BA Economics', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (8, 3, 'MSC-ECON', 'MSc Economics', 'Master', 2.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (9, 4, 'BSC-MATH', 'BSc Mathematics', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (10, 4, 'MSC-MATH', 'MSc Mathematics', 'Master', 2.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (11, 1, 'BSC-BA', 'BSc Business Administration', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (12, 1, 'MBA', 'Master of Business Administration', 'Master', 2.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (13, 7, 'BA-SOC', 'BA Sociology', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (14, 6, 'BA-PSY', 'BA Psychology', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (15, 5, 'BSC-PHYS', 'BSc Physics', 'Bachelor', 4.0, true, TIMESTAMPTZ '2024-01-01 00:00:00+00');

INSERT INTO students
    (student_id, programme_id, student_number, first_name, last_name, date_of_birth, gender, email, admission_date, student_status, created_at)
VALUES
    (1, 1, 'DEV-STU-0001', 'Synthetic', 'Student01', DATE '2023-09-01', 'Female', 'student01@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (2, 1, 'DEV-STU-0002', 'Synthetic', 'Student02', DATE '2023-09-01', 'Male', 'student02@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (3, 1, 'DEV-STU-0003', 'Synthetic', 'Student03', DATE '2023-09-01', 'Female', 'student03@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (4, 1, 'DEV-STU-0004', 'Synthetic', 'Student04', DATE '2023-09-01', 'Male', 'student04@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (5, 1, 'DEV-STU-0005', 'Synthetic', 'Student05', DATE '2022-09-01', 'Female', 'student05@university.test', DATE '2022-09-01', 'Graduated', TIMESTAMPTZ '2022-09-01 00:00:00+00'),
    (6, 2, 'DEV-STU-0006', 'Synthetic', 'Student06', DATE '2023-09-01', 'Male', 'student06@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (7, 2, 'DEV-STU-0007', 'Synthetic', 'Student07', DATE '2023-09-01', 'Female', 'student07@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (8, 2, 'DEV-STU-0008', 'Synthetic', 'Student08', DATE '2022-09-01', 'Male', 'student08@university.test', DATE '2022-09-01', 'Graduated', TIMESTAMPTZ '2022-09-01 00:00:00+00'),
    (9, 2, 'DEV-STU-0009', 'Synthetic', 'Student09', DATE '2023-09-01', 'Female', 'student09@university.test', DATE '2023-09-01', 'Deferred', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (10, 5, 'DEV-STU-0010', 'Synthetic', 'Student10', DATE '2023-09-01', 'Male', 'student10@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (11, 5, 'DEV-STU-0011', 'Synthetic', 'Student11', DATE '2023-09-01', 'Female', 'student11@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (12, 5, 'DEV-STU-0012', 'Synthetic', 'Student12', DATE '2022-09-01', 'Male', 'student12@university.test', DATE '2022-09-01', 'Graduated', TIMESTAMPTZ '2022-09-01 00:00:00+00'),
    (13, 4, 'DEV-STU-0013', 'Synthetic', 'Student13', DATE '2023-09-01', 'Female', 'student13@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (14, 4, 'DEV-STU-0014', 'Synthetic', 'Student14', DATE '2023-09-01', 'Male', 'student14@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (15, 11, 'DEV-STU-0015', 'Synthetic', 'Student15', DATE '2023-09-01', 'Female', 'student15@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (16, 11, 'DEV-STU-0016', 'Synthetic', 'Student16', DATE '2023-09-01', 'Male', 'student16@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (17, 7, 'DEV-STU-0017', 'Synthetic', 'Student17', DATE '2023-09-01', 'Female', 'student17@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (18, 7, 'DEV-STU-0018', 'Synthetic', 'Student18', DATE '2023-09-01', 'Male', 'student18@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (19, 7, 'DEV-STU-0019', 'Synthetic', 'Student19', DATE '2022-09-01', 'Female', 'student19@university.test', DATE '2022-09-01', 'Graduated', TIMESTAMPTZ '2022-09-01 00:00:00+00'),
    (20, 9, 'DEV-STU-0020', 'Synthetic', 'Student20', DATE '2023-09-01', 'Male', 'student20@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (21, 9, 'DEV-STU-0021', 'Synthetic', 'Student21', DATE '2023-09-01', 'Female', 'student21@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (22, 15, 'DEV-STU-0022', 'Synthetic', 'Student22', DATE '2023-09-01', 'Male', 'student22@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (23, 15, 'DEV-STU-0023', 'Synthetic', 'Student23', DATE '2023-09-01', 'Female', 'student23@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (24, 14, 'DEV-STU-0024', 'Synthetic', 'Student24', DATE '2023-09-01', 'Male', 'student24@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (25, 13, 'DEV-STU-0025', 'Synthetic', 'Student25', DATE '2023-09-01', 'Female', 'student25@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00'),
    (26, 12, 'DEV-STU-0026', 'Synthetic', 'Student26', DATE '2023-09-01', 'Male', 'student26@university.test', DATE '2023-09-01', 'Active', TIMESTAMPTZ '2023-09-01 00:00:00+00');

INSERT INTO staff
    (staff_id, department_id, staff_number, first_name, last_name, email, staff_type, job_title, employment_status, date_joined, created_at)
VALUES
    (1, 2, 'DEV-STF-0001', 'Synthetic', 'Staff01', 'staff01@university.test', 'Academic', 'Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (2, 2, 'DEV-STF-0002', 'Synthetic', 'Staff02', 'staff02@university.test', 'Academic', 'Senior Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (3, 2, 'DEV-STF-0003', 'Synthetic', 'Staff03', 'staff03@university.test', 'Academic', 'Professor', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (4, 1, 'DEV-STF-0004', 'Synthetic', 'Staff04', 'staff04@university.test', 'Academic', 'Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (5, 1, 'DEV-STF-0005', 'Synthetic', 'Staff05', 'staff05@university.test', 'Academic', 'Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (6, 3, 'DEV-STF-0006', 'Synthetic', 'Staff06', 'staff06@university.test', 'Academic', 'Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (7, 3, 'DEV-STF-0007', 'Synthetic', 'Staff07', 'staff07@university.test', 'Academic', 'Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (8, 4, 'DEV-STF-0008', 'Synthetic', 'Staff08', 'staff08@university.test', 'Academic', 'Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (9, 4, 'DEV-STF-0009', 'Synthetic', 'Staff09', 'staff09@university.test', 'Academic', 'Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (10, 8, 'DEV-STF-0010', 'Synthetic', 'Staff10', 'staff10@university.test', 'Academic', 'Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (11, 8, 'DEV-STF-0011', 'Synthetic', 'Staff11', 'staff11@university.test', 'Academic', 'Lecturer', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (12, 5, 'DEV-STF-0012', 'Synthetic', 'Staff12', 'staff12@university.test', 'Administrative', 'Coordinator', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (13, 6, 'DEV-STF-0013', 'Synthetic', 'Staff13', 'staff13@university.test', 'Administrative', 'Coordinator', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00'),
    (14, 7, 'DEV-STF-0014', 'Synthetic', 'Staff14', 'staff14@university.test', 'Technical', 'Technician', 'Active', DATE '2020-09-01', TIMESTAMPTZ '2024-01-01 00:00:00+00');

-- Each participating student receives one row per semester. The annual
-- reporting queries deliberately use COUNT(DISTINCT student_id).
WITH annual_records(academic_year_id, student_id, enrolment_status, level) AS (
    SELECT 1, student_id, 'Completed',
           CASE WHEN student_id <= 12 THEN 'Level 200'
                WHEN student_id <= 22 THEN 'Level 300'
                ELSE 'Level 400' END
    FROM generate_series(1, 26) AS student_id
    UNION ALL
    SELECT 2, student_id,
           CASE WHEN student_id = 9 THEN 'Deferred' ELSE 'Completed' END,
           CASE WHEN student_id = 1 THEN 'Level 100'
                WHEN student_id = 9 THEN 'Level 200'
                WHEN student_id BETWEEN 2 AND 8 OR student_id BETWEEN 10 AND 12 THEN 'Level 300'
                ELSE 'Level 400' END
    FROM generate_series(1, 26) AS student_id
    UNION ALL
    SELECT 3, student_id,
           CASE WHEN student_id = 9 THEN 'Deferred' ELSE 'Enrolled' END,
           CASE WHEN student_id IN (1, 9) THEN 'Level 200' ELSE 'Level 400' END
    FROM generate_series(1, 26) AS student_id
    WHERE student_id = 9
       OR student_id IN (1, 2, 3, 4, 6, 7, 10, 11, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26)
), annual_rows AS (
    SELECT row_number() OVER (ORDER BY ar.academic_year_id, ar.student_id, se.semester_id)::bigint AS enrolment_id,
           ar.student_id,
           ar.academic_year_id,
           se.semester_id,
           se.start_date AS enrolment_date,
           ar.enrolment_status,
           ar.level
    FROM annual_records ar
    JOIN semesters se
      ON se.academic_year_id = ar.academic_year_id
)
INSERT INTO enrolments
    (enrolment_id, student_id, academic_year_id, semester_id, enrolment_date, enrolment_status, level, created_at)
SELECT enrolment_id, student_id, academic_year_id, semester_id,
       enrolment_date, enrolment_status, level,
       enrolment_date::timestamptz
FROM annual_rows;

SELECT setval('university.academic_years_academic_year_id_seq', (SELECT MAX(academic_year_id) FROM academic_years));
SELECT setval('university.departments_department_id_seq', (SELECT MAX(department_id) FROM departments));
SELECT setval('university.programmes_programme_id_seq', (SELECT MAX(programme_id) FROM programmes));
SELECT setval('university.semesters_semester_id_seq', (SELECT MAX(semester_id) FROM semesters));
SELECT setval('university.students_student_id_seq', (SELECT MAX(student_id) FROM students));
SELECT setval('university.staff_staff_id_seq', (SELECT MAX(staff_id) FROM staff));
SELECT setval('university.enrolments_enrolment_id_seq', (SELECT MAX(enrolment_id) FROM enrolments));
