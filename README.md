# Course Management System (CMS)

A full-stack web application built to manage course creation, enrollment, and learning workflows for both instructors and students. This project demonstrates modern web development practices using a powerful tech stack including Next.js, TypeScript, MongoDB, tRPC, and more.

## 🚀 Features

- 🔐 Authentication and Authorization (NextAuth.js)
- 👨‍🏫 Instructor Dashboard to Create and Manage Courses
- 🎓 Student Interface to Browse, Enroll, and Track Courses
- 📁 File Uploads for Course Materials via UploadThing
- ✅ Form Handling and Validation using React Hook Form + Zod
- 🔄 End-to-End Type Safety with tRPC and Zod
- 🎨 Clean, Responsive UI using TailwindCSS and shadcn/ui

## 🛠️ Tech Stack

- **Frontend**: Next.js, TypeScript, React, TailwindCSS, shadcn/ui
- **Backend**: Node.js (via Next.js API routes), tRPC, MongoDB
- **Auth**: NextAuth.js
- **Validation**: Zod, React Hook Form
- **File Uploads**: UploadThing
- **Styling & Components**: TailwindCSS, shadcn/ui

  ## 📦 Installation

```bash
git clone https://github.com/samrosemohammed/next-cms.git
cd next-cms
npm install
```

## ⚙️ Setup
1. Create a .env.local file in the root directory and add the following variables:
```bash
MONGODB_URI='your_mongodb_connection_string'
NEXTAUTH_SECRET=`your_nextauth_secret'
NEXTAUTH_URL='your_nextauth_url'
RESEND_API_KEY='your_resend_api_key'
UPLOADTHING_TOKEN='your_uploadthing_token'
```
2. Run the development server:
```bash
npm run dev
```
