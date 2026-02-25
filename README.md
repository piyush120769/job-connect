# 💼 JobConnect - Online Job Portal Platform

A full-featured job portal platform connecting job seekers with recruiters.

## Features

### For Job Seekers
- Register and create your profile
- Browse and search job listings with filters
- Apply for jobs with **resume upload** (PDF/DOC/DOCX)
- Track application status in real-time
- Join scheduled video interview rooms

### For Recruiters
- Post, edit, and delete job listings
- View all applications per job
- **Download candidate resumes**
- Shortlist candidates and update application status
- **Schedule interviews** (video/phone/in-person)
- Join in-platform video interview room

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will be running at http://localhost:3000

## 🛠 Tech Stack

**Frontend:** React.js, React Router, Axios  
**Backend:** Node.js, Express.js  
**Database:** MongoDB with Mongoose  
**Auth:** JWT + bcryptjs  
**File Upload:** Multer  

## 📁 Project Structure

```
jobconnect/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── jobController.js
│   │   └── applicationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   └── applicationRoutes.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── JobCard.jsx
        │   └── Footer.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Jobs.jsx
        │   ├── JobDetails.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   └── InterviewRoom.jsx
        └── context/AuthContext.js
```

## 🔑 Environment Variables

Create `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobconnect
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

## 📦 API Endpoints

### Users
- `POST /api/users/register` - Register
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile/resume` - Upload profile resume

### Jobs
- `GET /api/jobs` - List jobs (with filters)
- `GET /api/jobs/:id` - Job details
- `POST /api/jobs` - Create job (recruiter)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/my-jobs` - Recruiter's jobs

### Applications
- `POST /api/applications/job/:jobId` - Apply (with resume)
- `GET /api/applications/my` - My applications
- `GET /api/applications/recruiter` - All recruiter applications
- `GET /api/applications/job/:jobId` - Job applications
- `PUT /api/applications/:id/status` - Update status
- `PUT /api/applications/:id/interview` - Schedule interview
- `GET /api/applications/:id/resume` - Download resume
