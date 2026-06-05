# Verix 

Verix is an intelligent web application designed to scan, detect, and verify original products using custom AI technology (YOLOv8). It features a robust Django backend and a modern, fully-automated React frontend.

## 🚀 Features

- **AI-Powered Scanning:** Utilizes custom-trained YOLOv8 models (`best.pt`) for fast and accurate product verification.
- **Fully Automated Verification:** Zero manual brand selection needed. The system purely relies on the AI engine to detect and verify original items vs counterfeits.
- **Brand Management:** Comprehensive dashboard to manage, track, and monitor registered brands and scanning history.
- **User Authentication:** Secure login, registration, and role-based access control.
- **Secure Architecture:** Sensitive keys and database records are securely managed through environment configurations.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (built with Vite)
- **Styling:** Tailwind CSS (Modern Glassmorphism UI)
- **State Management / API:** React hooks, custom API client (Axios)

### Backend
- **Framework:** Python, Django & Django REST Framework
- **Database:** SQLite (Default for development)
- **AI Engine:** Ultralytics YOLOv8 (Computer Vision)
- **Security:** python-dotenv for secret management

## ⚙️ Getting Started

Follow these steps to run the project locally.

### Prerequisites
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- Git

### 1. Backend Setup

Open a terminal and navigate to the `backend` folder:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On Mac/Linux
source venv/bin/activate
```

Install the required Python packages:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder with your secret keys:
```env
SECRET_KEY=your-super-secret-key
DEBUG=True
```

Run database migrations and start the server:
```bash
python manage.py migrate
python manage.py runserver
```

The backend server will run at `http://127.0.0.1:8000/`.

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
```

Install the required Node packages:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173/` (or the port specified by Vite).

## 📄 License
This project is proprietary. All rights reserved.
