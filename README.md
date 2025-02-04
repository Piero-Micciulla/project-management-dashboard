# Project Management Dashboard - README

## Overview
This project is a simple full-stack web application with a Flask backend and a React (TypeScript) frontend. The app includes user registration, login functionality with JWT authentication, and basic API endpoints to manage user data.

## Backend Setup (Flask - Python)

1. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

2. **Create and Activate a Virtual Environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Backend Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask Application:**
   ```bash
   flask run
   ```
   The backend will run on [http://127.0.0.1:5000](http://127.0.0.1:5000) by default.

## API Endpoints

### 1. **POST /api/auth/register**
Registers a new user with a username, email, and password.

**Example Request Body:**
```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Example Response:**
```json
{
  "message": "User registered"
}
```

### 2. **POST /api/auth/login**
Logs in a user and returns a JWT token if credentials are correct.

**Example Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Example Response:**
```json
{
  "token": "your-jwt-token"
}
```

## Frontend Setup (React/TypeScript)

1. **Navigate to the Frontend Directory:**
   ```bash
   cd frontend
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Frontend Application:**
   ```bash
   npm start
   ```
   The React app will be running on [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Frontend Features

- **Registration Page:** A simple form for registering a new user with a username, email, and password.
- **Login Page:** A simple form for logging in with an email and password, and receiving a JWT token.
- **Authenticated Requests:** Once logged in, the JWT token is stored in local storage (or cookies) and is used to make authenticated API requests.

## Running the Application

### Backend:
Run the Flask server with:
```bash
flask run
```
This runs the backend on [http://127.0.0.1:5000](http://127.0.0.1:5000).

### Frontend:
Start the React app with:
```bash
npm start
```
This runs the frontend on [http://127.0.0.1:3000](http://127.0.0.1:3000).

You can now interact with the app via the frontend at [http://127.0.0.1:3000](http://127.0.0.1:3000), which communicates with the backend API at [http://127.0.0.1:5000](http://127.0.0.1:5000).

## Database Migrations
We use Flask-Migrate to manage database schema changes. Here are the common commands:

- **Initialize migrations:**
  ```bash
  flask db init
  ```

- **Create a new migration after modifying models:**
  ```bash
  flask db migrate -m "description of migration"
  ```

- **Apply the migration:**
  ```bash
  flask db upgrade
  ```

- **Downgrade a migration (if needed):**
  ```bash
  flask db downgrade
  ```

## Technologies Used

### Backend:
- Flask (Python)
- Flask-SQLAlchemy (ORM for database interactions)
- Flask-Migrate (Database migrations)
- Flask-JWT-Extended (JWT Authentication)
- SQLite (Database)

### Frontend:
- React (with TypeScript)
- Axios (for making API requests)
- CSS (for styling)


## Deployment Tools

- **Backend:** Deployed on **Render** (https://render.com/) for hosting the Flask API.
- **Frontend:** Deployed on **Netlify** (https://www.netlify.com/) for hosting the React application.


## Contributing
Feel free to fork this repository and submit pull requests if you have any improvements or fixes.

If you encounter any issues, please open an issue on GitHub.

