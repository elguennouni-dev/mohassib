# Docker

This project runs as three containers:

- `db`: PostgreSQL 16
- `backend`: Spring Boot API on port `8080`
- `frontend`: Vite production build served by Nginx on port `5173`

Start everything from the repository root:

```powershell
docker compose up --build -d
```

Open the app at:

```text
http://localhost:5173
```

The backend API is also published at:

```text
http://localhost:8080/api/v1
```

Stop the stack:

```powershell
docker compose down
```

Remove the database and generated file volumes too:

```powershell
docker compose down -v
```
