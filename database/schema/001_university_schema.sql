-- University reporting schema.
-- Fresh-database initialization only. Do not run against an existing database.

CREATE SCHEMA university;

CREATE SEQUENCE university.academic_years_academic_year_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE university.departments_department_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE university.enrolments_enrolment_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE university.programmes_programme_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE university.semesters_semester_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE university.staff_staff_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE university.students_student_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE university.academic_years (
    academic_year_id bigint NOT NULL DEFAULT nextval('university.academic_years_academic_year_id_seq'::regclass),
    year_name varchar(20) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_current boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT academic_years_pkey PRIMARY KEY (academic_year_id),
    CONSTRAINT uq_academic_year_name UNIQUE (year_name),
    CONSTRAINT chk_academic_year_dates CHECK (end_date > start_date)
);

CREATE TABLE university.departments (
    department_id bigint NOT NULL DEFAULT nextval('university.departments_department_id_seq'::regclass),
    department_code varchar(20) NOT NULL,
    department_name varchar(150) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT departments_pkey PRIMARY KEY (department_id),
    CONSTRAINT uq_departments_code UNIQUE (department_code),
    CONSTRAINT uq_departments_name UNIQUE (department_name),
    CONSTRAINT chk_departments_code_not_empty CHECK (btrim(department_code) <> ''),
    CONSTRAINT chk_departments_name_not_empty CHECK (btrim(department_name) <> '')
);

CREATE TABLE university.semesters (
    semester_id bigint NOT NULL DEFAULT nextval('university.semesters_semester_id_seq'::regclass),
    academic_year_id bigint NOT NULL,
    semester_name varchar(30) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT semesters_pkey PRIMARY KEY (semester_id),
    CONSTRAINT uq_semesters_id_academic_year UNIQUE (semester_id, academic_year_id),
    CONSTRAINT uq_semesters_year_name UNIQUE (academic_year_id, semester_name),
    CONSTRAINT chk_semester_dates CHECK (end_date > start_date),
    CONSTRAINT chk_semester_name CHECK (semester_name IN ('First Semester', 'Second Semester')),
    CONSTRAINT fk_semesters_academic_year FOREIGN KEY (academic_year_id)
        REFERENCES university.academic_years (academic_year_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE university.programmes (
    programme_id bigint NOT NULL DEFAULT nextval('university.programmes_programme_id_seq'::regclass),
    department_id bigint NOT NULL,
    programme_code varchar(30) NOT NULL,
    programme_name varchar(200) NOT NULL,
    award_type varchar(50) NOT NULL,
    duration_years numeric(3,1) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT programmes_pkey PRIMARY KEY (programme_id),
    CONSTRAINT uq_programmes_code UNIQUE (programme_code),
    CONSTRAINT uq_programmes_department_name UNIQUE (department_id, programme_name),
    CONSTRAINT chk_programmes_code_not_empty CHECK (btrim(programme_code) <> ''),
    CONSTRAINT chk_programmes_name_not_empty CHECK (btrim(programme_name) <> ''),
    CONSTRAINT chk_programmes_duration CHECK (duration_years > 0 AND duration_years <= 10),
    CONSTRAINT chk_programmes_award_type CHECK (award_type IN ('Certificate', 'Diploma', 'Bachelor', 'Master', 'Doctorate')),
    CONSTRAINT fk_programmes_department FOREIGN KEY (department_id)
        REFERENCES university.departments (department_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE university.students (
    student_id bigint NOT NULL DEFAULT nextval('university.students_student_id_seq'::regclass),
    programme_id bigint NOT NULL,
    student_number varchar(30) NOT NULL,
    first_name varchar(100) NOT NULL,
    middle_name varchar(100),
    last_name varchar(100) NOT NULL,
    date_of_birth date,
    gender varchar(20),
    email varchar(200),
    admission_date date NOT NULL,
    student_status varchar(30) NOT NULL DEFAULT 'Active',
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT students_pkey PRIMARY KEY (student_id),
    CONSTRAINT uq_students_number UNIQUE (student_number),
    CONSTRAINT uq_students_email UNIQUE (email),
    CONSTRAINT chk_students_first_name CHECK (btrim(first_name) <> ''),
    CONSTRAINT chk_students_last_name CHECK (btrim(last_name) <> ''),
    CONSTRAINT chk_students_gender CHECK (gender IS NULL OR gender IN ('Male', 'Female', 'Other', 'Prefer Not to Say')),
    CONSTRAINT chk_students_status CHECK (student_status IN ('Active', 'Graduated', 'Deferred', 'Withdrawn', 'Suspended')),
    CONSTRAINT fk_students_programme FOREIGN KEY (programme_id)
        REFERENCES university.programmes (programme_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE university.staff (
    staff_id bigint NOT NULL DEFAULT nextval('university.staff_staff_id_seq'::regclass),
    department_id bigint NOT NULL,
    staff_number varchar(30) NOT NULL,
    first_name varchar(100) NOT NULL,
    middle_name varchar(100),
    last_name varchar(100) NOT NULL,
    email varchar(200) NOT NULL,
    staff_type varchar(30) NOT NULL,
    job_title varchar(150),
    employment_status varchar(30) NOT NULL DEFAULT 'Active',
    date_joined date,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT staff_pkey PRIMARY KEY (staff_id),
    CONSTRAINT uq_staff_number UNIQUE (staff_number),
    CONSTRAINT uq_staff_email UNIQUE (email),
    CONSTRAINT chk_staff_first_name CHECK (btrim(first_name) <> ''),
    CONSTRAINT chk_staff_last_name CHECK (btrim(last_name) <> ''),
    CONSTRAINT chk_staff_type CHECK (staff_type IN ('Academic', 'Administrative', 'Technical', 'Support')),
    CONSTRAINT chk_staff_status CHECK (employment_status IN ('Active', 'Inactive', 'On Leave', 'Retired')),
    CONSTRAINT fk_staff_department FOREIGN KEY (department_id)
        REFERENCES university.departments (department_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE university.enrolments (
    enrolment_id bigint NOT NULL DEFAULT nextval('university.enrolments_enrolment_id_seq'::regclass),
    student_id bigint NOT NULL,
    academic_year_id bigint NOT NULL,
    semester_id bigint NOT NULL,
    enrolment_date date NOT NULL DEFAULT CURRENT_DATE,
    enrolment_status varchar(30) NOT NULL DEFAULT 'Enrolled',
    level varchar(20),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT enrolments_pkey PRIMARY KEY (enrolment_id),
    CONSTRAINT uq_student_semester UNIQUE (student_id, semester_id),
    CONSTRAINT chk_enrolment_status CHECK (enrolment_status IN ('Enrolled', 'Completed', 'Withdrawn', 'Deferred')),
    CONSTRAINT chk_enrolment_level CHECK (level IS NULL OR level IN ('Level 100', 'Level 200', 'Level 300', 'Level 400', 'Level 500', 'Level 600')),
    CONSTRAINT fk_enrolments_academic_year FOREIGN KEY (academic_year_id)
        REFERENCES university.academic_years (academic_year_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_enrolments_semester_year FOREIGN KEY (semester_id, academic_year_id)
        REFERENCES university.semesters (semester_id, academic_year_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_enrolments_student FOREIGN KEY (student_id)
        REFERENCES university.students (student_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

ALTER SEQUENCE university.academic_years_academic_year_id_seq OWNED BY university.academic_years.academic_year_id;
ALTER SEQUENCE university.departments_department_id_seq OWNED BY university.departments.department_id;
ALTER SEQUENCE university.enrolments_enrolment_id_seq OWNED BY university.enrolments.enrolment_id;
ALTER SEQUENCE university.programmes_programme_id_seq OWNED BY university.programmes.programme_id;
ALTER SEQUENCE university.semesters_semester_id_seq OWNED BY university.semesters.semester_id;
ALTER SEQUENCE university.staff_staff_id_seq OWNED BY university.staff.staff_id;
ALTER SEQUENCE university.students_student_id_seq OWNED BY university.students.student_id;

CREATE INDEX idx_enrolments_academic_year ON university.enrolments (academic_year_id);
CREATE INDEX idx_enrolments_semester ON university.enrolments (semester_id);
CREATE INDEX idx_enrolments_status ON university.enrolments (enrolment_status);
CREATE INDEX idx_enrolments_student ON university.enrolments (student_id);
CREATE INDEX idx_programmes_department ON university.programmes (department_id);
CREATE INDEX idx_staff_department ON university.staff (department_id);
CREATE INDEX idx_students_programme ON university.students (programme_id);
CREATE INDEX idx_students_status ON university.students (student_status);
