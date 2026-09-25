# Development Database

This directory contains the reproducible PostgreSQL schema and synthetic seed data for the University Report System.

## Files

- `schema/001_university_schema.sql` creates the `university` schema and its seven tables.
- `seed/001_development_seed.sql` inserts deterministic synthetic development data.

These scripts are intentionally **fresh-database-only**. They do not contain `DROP`, `TRUNCATE`, or reset commands and must not be run against the working `birtdb` database.

## Prerequisites

- Docker Desktop with Compose.
- PostgreSQL 16-compatible client tools if running commands outside the container.
- The repository checkout and its backend/frontend dependencies.

The repository uses the PostgreSQL 16-compatible `postgis/postgis:16-3.5` image from `docker-compose.yml`.

## Connection Values

- Host from Windows: `localhost`
- Host port: `5433`
- Container port: `5432`
- Database: `birtdb`
- Schema: `university`
- Database user: `birt`

Compose peers use the container address and port, while host tools use `localhost:5433`. Do not commit passwords or complete connection strings containing passwords.

## Fresh Initialization

Start PostgreSQL:

```powershell
docker compose up -d postgres
```

Apply the schema to a new, empty database:

```powershell
Get-Content .\database\schema\001_university_schema.sql -Raw |
  docker exec -i birt-postgres psql -U birt -d birtdb
```

Apply the synthetic seed:

```powershell
Get-Content .\database\seed\001_development_seed.sql -Raw |
  docker exec -i birt-postgres psql -U birt -d birtdb
```

The scripts are not safe to rerun. For a repeatable test, create a separate temporary database and apply both files there. Never reset the shared working database just to validate reproducibility.

## Verification

```powershell
docker exec birt-postgres psql -U birt -d birtdb -c "\dt university.*"
docker exec birt-postgres psql -U birt -d birtdb -c "SELECT year_name, is_current FROM university.academic_years ORDER BY start_date;"
docker exec birt-postgres psql -U birt -d birtdb -c "SELECT COUNT(*) FROM university.students; SELECT COUNT(*) FROM university.staff;"
```

The seed is expected to provide:

- Academic years `2024/2025`, `2025/2026`, and `2026/2027`.
- `2026/2027` marked as current.
- 26 students, 14 staff, 8 departments, and 15 programmes.
- Annual participating populations of 26, 25, and 21 using `Enrolled` or `Completed` and `COUNT(DISTINCT student_id)`.
- Two semester rows per seeded student-year participation record.

## Application Connections

The backend reads `DATABASE_URL` from `backend/.env`. Use a local-only value such as:

```env
DATABASE_URL=postgresql://birt:<local-password>@localhost:5433/birtdb
```

The BIRT report uses the same host database through JDBC at `localhost:5433/birtdb`. Its local report configuration and the backend environment must point to the same database, but credentials and machine-specific paths must remain local.

## Synthetic Data and Scope

All seeded names, email addresses, student numbers, and staff numbers are synthetic development identities. This seed is for local development, testing, and demonstration only. It is not production data.

The schema intentionally does not add unsupported history for student status, graduation, staff employment, departments, or programmes. Staff and current KPI metrics remain current-state metrics. The legacy `sample_metrics` smoke-test table is not part of the live university schema and is not included in this university seed.

## Safety

Do not run destructive database commands against `birtdb` unless the database owner explicitly approves the operation and a separate backup/validation plan exists. Use an isolated temporary database for schema and seed tests.

The current environment may report a PostgreSQL collation-version warning because the database was created under a different operating-system collation library. This documentation does not authorize refreshing that collation or modifying the working database.
