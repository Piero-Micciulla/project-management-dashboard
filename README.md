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

## 🛠️ Technologies & Tools Used

Throughout the development of this project, we integrated several essential tools and libraries to enhance functionality and maintainability. Below are the new technologies we used:

### 1️⃣ **React Router**
   - We used **React Router** to enable client-side routing in our application.
   - This allows us to create different pages (Dashboard, Manage Users, Profile, Login, etc.) without requiring full-page reloads.
   - Routes are defined inside `App.tsx` using `<Routes>` and `<Route>` components.

   🔗 **Documentation**: [React Router](https://reactrouter.com/)

---

### 2️⃣ **Material UI (MUI)**
   - We styled our UI components with **Material UI**, a popular React component library.
   - It provides pre-built **buttons, tables, dialogs, alerts, and form controls**, making the frontend more professional and consistent.
   - Examples of **MUI components** used:
     - `<Button>` for actions like **Edit, Delete, Add User**.
     - `<Dialog>` for modals when adding/editing users.
     - `<Table>` for displaying user lists.

   🔗 **Documentation**: [Material UI](https://mui.com/)

---

### 3️⃣ **Cloudinary (Image Hosting & Management)**
   - We integrated **Cloudinary** to handle **image uploads** for user avatars.
   - Users can upload profile pictures, which get stored in Cloudinary and are retrieved via a **secure URL**.
   - The Flask backend handles uploads via `cloudinary.uploader.upload()`.
   - Avatars are displayed using `<Avatar src={user.avatar} />` in **React**.

   🔗 **Documentation**: [Cloudinary](https://cloudinary.com/documentation)

---

### 4️⃣ **Axios (API Requests)**
   - We used **Axios** to handle API requests in React.
   - It allows fetching user data, updating profiles, and uploading avatars via HTTP requests.
   - Example: 
     ```tsx
     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
       headers: { Authorization: `Bearer ${token}` },
     });
     ```

   🔗 **Documentation**: [Axios](https://axios-http.com/)

---

### 5️⃣ **Flask-JWT-Extended (Authentication & Authorization)**
   - This Flask extension manages **JWT authentication**.
   - It allows users to log in and receive an **access token**, which is used in API requests.
   - Protected routes (like `/api/users`) require authentication using `@jwt_required()`.

   🔗 **Documentation**: [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/en/stable/)

---

### 6️⃣ **Flask-SQLAlchemy (Database ORM)**
   - We used **SQLAlchemy** to manage our database models in Flask.
   - It simplifies database operations, such as **creating users, updating avatars, and managing roles**.
   - Queries are done via:
     ```python
     user = User.query.get(user_id)
     ```

   🔗 **Documentation**: [SQLAlchemy](https://www.sqlalchemy.org/)

---

### 7️⃣ **React Context API (Global State Management)**
   - We used **React Context API** to manage authentication globally.
   - User authentication state (token, user info) is stored in `AuthContext.tsx` and used across all components.

   🔗 **Documentation**: [React Context API](https://react.dev/reference/react/useContext)

---

### 📌 **Summary**
| Technology  | Purpose |
|-------------|---------|
| **React Router**  | Client-side navigation |
| **Material UI**  | Pre-built UI components |
| **Cloudinary**  | Image upload & hosting |
| **Axios**  | API requests (GET, POST, PUT, DELETE) |
| **Flask-JWT-Extended**  | Secure authentication |
| **SQLAlchemy**  | Database ORM |
| **React Context API**  | Global state management |

---


## Deployment Tools

- **Backend:** Deployed on **Render** (https://render.com/) for hosting the Flask API.
- **Frontend:** Deployed on **Netlify** (https://www.netlify.com/) for hosting the React application.


## Contributing
Feel free to fork this repository and submit pull requests if you have any improvements or fixes.

If you encounter any issues, please open an issue on GitHub.

