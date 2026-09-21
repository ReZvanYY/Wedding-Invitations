# 💍 Martine & Thomas - Wedding Invitation App

A full-stack web application built for a wedding invitation, event information. Guests can create accounts, view wedding details, submit their attendance (including plus-ones and allergies), and update their responses at any time. An exclusive Admin Dashboard allows the couple to track total attendance and guest messages in real-time.

## ✨ Features

- **User Authentication:** Secure registration and login using JWT (JSON Web Tokens) and bcrypt password hashing.
- **Dynamic RSVP/Attendance Form:** 
  - Guests can add multiple plus-ones.
  - Toggle attendance status (Attending / Not Attending) for each individual.
  - Submit dietary restrictions or comments.
- **Edit Capabilities:** If a user has already submitted a response, the form automatically pre-fills their previous data, allowing them to easily update their RSVP.
- **Admin Dashboard:** A protected route (restricted to a specific Admin user ID) that aggregates all responses, displays a total headcount of attending guests, and lists individual comments.
- **Responsive UI:** A modern, mobile-friendly interface built with Tailwind CSS, featuring glassmorphism elements and elegant typography.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS
- React Router DOM
- Context API (for Global Auth State)

**Backend:**
- Node.js
- Express.js
- MySQL2 (Connection Pooling)
- JSON Web Tokens (JWT)
- bcrypt (Password Hashing)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A MySQL database (Railway)