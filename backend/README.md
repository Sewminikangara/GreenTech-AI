# GreenTech Advisor AI - Python FastAPI Backend

This is the scalable REST API backend for the **GreenTech Advisor AI** conversational assistant, built using Python, FastAPI, SQLAlchemy, Pydantic, and PostgreSQL.

---

## 🛠️ Technology Stack

- **Framework**: FastAPI (Asynchronous REST API)
- **Database ORM**: SQLAlchemy 2.0
- **Database Engine**: PostgreSQL 16
- **Data Validation**: Pydantic v2
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing
- **Server Runtime**: Uvicorn

---

## 📁 Repository Structure

```
backend/
 ├── app/
 │    ├── main.py            # Entrypoint (FastAPI App, Middlewares, CORS)
 │    ├── config/            # Settings management
 │    ├── database/          # Connection session pools
 │    ├── models/            # SQLAlchemy database tables
 │    ├── schemas/           # Pydantic validation structures
 │    ├── routes/            # APIRouter endpoints
 │    └── services/          # Business logic layers (Auth, AI mock)
 ├── requirements.txt        # Python dependency manifest
 ├── run.py                  # Server runner utility
 └── .env                    # Active configurations
```

---

## 🚀 Setup & Execution

### 1. Initialize Virtual Environment
Navigate to the `backend/` folder and create a virtual environment:
```bash
cd backend
python3 -m venv venv
```

Activate the environment:
- **macOS/Linux**:
  ```bash
  source venv/bin/activate
  ```
- **Windows**:
  ```cmd
  venv\Scripts\activate
  ```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database & Configurations
Ensure PostgreSQL is running locally. Make sure you have created the database (Prisma migration did this automatically during Node setup, but if you need to create it manually: `createdb greentech_advisor`).

Create a `.env` file in the `backend/` directory:
```env
PORT=8000
DATABASE_URL="postgresql://username:password@localhost:5432/greentech_advisor"
JWT_SECRET="your-super-secret-key"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 4. Run the API Server
Start the development server using:
```bash
python run.py
```
The server will start on **`http://localhost:8000`** with hot-reloading active.

- Interactive API Docs (Swagger): `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`

---

## 🔌 API Route Catalog

| Endpoint | Method | Security | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Public | Inspects server health and PostgreSQL connectivity. |
| `/api/users/register` | `POST` | Public | Registers a new account. |
| `/api/users/login` | `POST` | Public | Authenticates credentials and returns a Bearer JWT. |
| `/api/conversations` | `POST` | Private (JWT) | Initiates a new chat session. |
| `/api/conversations` | `GET` | Private (JWT) | Lists all chat sessions for the active user. |
| `/api/conversations/{id}` | `GET` | Private (JWT) | Retrieves metadata for a target conversation. |
| `/api/conversations/{id}/messages` | `GET` | Private (JWT) | Retrieves the message log for a target conversation. |
| `/api/chat` | `POST` | Private (JWT) | Submits a prompt and returns the AI reply. |
