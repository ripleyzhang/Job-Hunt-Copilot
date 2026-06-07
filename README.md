This is a Job Hunting Copilot using Node.js as frontend and PostgreSQL&Python as backend.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Docker deploy:

```bash
docker run --name internship-tracker-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=internship_copilot \
  -p 5432:5432 \
  -d postgres:16
```

Run backend server in a new terminal.

```bash
cd backend
uvicorn app.main:app --reload
```
