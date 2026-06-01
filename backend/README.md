# Backend

FastAPI backend for the application tracker.

## Setup

1. Create a PostgreSQL database:

   ```bash
   createdb internship_copilot
   ```

2. Create and activate a virtual environment:

   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure the database:

   ```bash
   cp .env.example .env
   ```

   Update `DATABASE_URL` if your PostgreSQL user, password, host, port, or
   database name differ.

5. Run the API:

   ```bash
   uvicorn app.main:app --reload
   ```

The API will create the `applications` table on startup.

## Endpoints

- `GET /applications`
- `GET /applications/{id}`
- `POST /applications`
- `PUT /applications/{id}`
- `DELETE /applications/{id}`

## Tests

```bash
pytest
```

Tests use SQLite with a dependency override, so they do not require a running
PostgreSQL server.
