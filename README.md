# 🚀 Career Compass – AI-Powered Resume & Job Matching Platform

Career Compass is a **full-stack AI-powered web application** designed to analyze the compatibility between a **candidate’s resume** and a **job description**, identify **skill gaps**, and provide **personalized career guidance using Google Gemini AI**.

This project demonstrates practical implementation of:
- Full-stack web development
- Secure authentication & authorization
- AI integration for real-world use cases
- Resume parsing and NLP-based matching logic
- Visual analytics for decision support

---

## 🧠 Problem Statement

Students often struggle to:
- Understand whether their resume matches a specific job role  
- Identify missing technical and soft skills  
- Plan a structured career improvement strategy  

Currently, there is no simple platform that provides:
- Automated resume–job description matching  
- Skill gap visualization  
- AI-powered personalized career guidance  

---

## ✅ Solution Overview

Career Compass addresses these challenges by:
- Accepting resume and job description uploads  
- Extracting and analyzing text from uploaded files  
- Computing a **match score and missing skills**  
- Visualizing results using interactive charts  
- Providing **AI-based career recommendations** via Gemini  

---

## 🛠️ Technology Stack

### 🎨 Frontend
- React.js with TypeScript  
- Vite  
- Tailwind CSS  
- HTML5, CSS3  
- Fetch API  

### ⚙️ Backend
- Python 3.11  
- FastAPI  
- Uvicorn  
- SQLAlchemy ORM  
- JWT Authentication  
- Passlib (pbkdf2_sha256) for secure password hashing  

### 🗄️ Database
- SQLite (Proof of Concept)  
- Architecture supports future upgrade to **PostgreSQL / MongoDB**

### 🤖 AI Integration
- Google Gemini 1.5 / Pro API  

---

## ✨ Key Features

### 🔐 Authentication System
- User registration & login  
- JWT-based session management  
- Secure password hashing  
- Logout & session protection  

### 📝 Resume–Job Matching System
- Resume upload (PDF / DOCX)  
- Job description upload  
- Text extraction using `pypdf` & `python-docx`  
- Resume–JD similarity scoring  
- Detection of missing skills  
- Skill gap visualization using pie charts  

### 🤖 AI Career Assistant
- Real-time AI-based career Q&A  
- Personalized guidance using Gemini API  
- Skill roadmap recommendations  

### 📊 Dashboard & Visualization
- Resume match score progress bar  
- Skill gap pie chart using pure CSS (`conic-gradient`)  
- Real-time UI updates  

---

## ⚙️ How to Run the Project Locally

### ✅ Backend Setup (FastAPI)

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```
### ✅ Frontend Setup (React + Vite)
```
cd frontend
npm install
npm run dev
```
Frontend URL → http://localhost:5173

Backend URL → http://localhost:8000

## 🔐 Environment Variables

Create a .env file inside the backend folder:

DATABASE_URL=sqlite:///./db.sqlite3
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key

## 📦 Project Structure

```
Career_Compass_/
│── backend/
│   ├── main.py
│   ├── auth.py
│   ├── schemas.py
│   ├── models.py
│   ├── match_logic.py
│   ├── gemini_client.py
│   └── database.py
│
│── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
│── .gitignore
│── README.md
```

## 👨‍💻 Developer Information

Dinesh Manogaran

Final Year Electronics & Communication Engineering (ECE) Student

Aspiring Software Developer

## 🎯 Project Objective

This project was developed to demonstrate:
- Full-stack application development skills
- Secure authentication implementation
- AI integration using real-world APIs
- Backend API design using FastAPI
- Database handling using ORM
- Resume analysis and skill gap detection logic
- Visualization and UI interactivity

## 🎉 Conclusion

Career Compass is a production-oriented Proof-of-Concept (POC) that showcases my ability to:
- Design scalable software architecture
- Integrate AI into real-world applications
- Build secure, data-driven full-stack systems
