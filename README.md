# Brand Guard

Brand Guard is an intelligent web application designed to scan, detect, and verify brands using AI technology (YOLOv3). It features a robust Django backend and a modern React frontend.

## 🚀 Features

- **AI-Powered Scanning:** Utilizes YOLOv8 models for fast and accurate brand detection in images.
- **Brand Management:** Comprehensive dashboard to manage, track, and monitor registered brands.
- **Alerts & Reports:** Keep track of scan history and receive alerts for unrecognized or suspicious products.
- **User Authentication:** Secure login, registration, and role-based access control.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (built with Vite)
- **Styling:** Tailwind CSS
- **State Management / API:** React hooks, custom client API

### Backend
- **Framework:** Python, Django & Django REST Framework
- **Database:** SQLite (default for development)
- **AI Engine:** YOLOv8 (Computer Vision)

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
