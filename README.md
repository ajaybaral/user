# User Profile Management API (TypeScript)

## Overview
This project is a user profile management API built with TypeScript, Express.js, and MongoDB. It supports user registration, profile retrieval, profile updates, and JWT-based authentication. Only authenticated users can access or update their own profiles.

### Core Features:
- User Registration/Profile Creation
- Profile Retrieval
- Profile Update
- JWT Authentication
- Protected Routes (Users can only access their own profiles)
- Error Handling

### User Profile Data:
- **Required:** name, email, address, password (hashed)
- **Optional:** bio, profile picture URL

---

## Tech Stack
- **Backend:** Express.js (TypeScript)
- **Database:** MongoDB
- **Authentication:** JWT

## Prerequisites
- **Node.js (v18+)**
- **MongoDB (local or remote)**

---

## Setup Instructions

### Clone the repository:
```bash
git clone <repo-url>
cd user-profile-api
```

### Install dependencies:
```bash
npm install
```



### Running the Server:
```bash
npm run dev
```
The server will start on `http://localhost:5000`

### Running in Production:
```bash
npm start
```

---

## API Documentation
Use the Postman collection provided https://ajay44-0211.postman.co/workspace/Ajay-Workspace~d536f0bb-e80e-4bea-af8c-2cdc1238da08/collection/39143302-ce4b0ffb-6ef7-410b-a8f2-0473ecf179eb?action=share&creator=39143302

---

## Project Structure
```
user-profile-api
├── src
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middlewares
│   └── utils
├── .env
├── package.json
└── README.md
```


