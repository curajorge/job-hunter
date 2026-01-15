# Job Search Organizer Application Blueprint

## 1. Overview

This document outlines the plan and progress for the Job Search Organizer application. The goal is to create a comprehensive tool to manage and streamline the job search process.

## 2. Core Features

*   **Job Tracker:** Manage a list of jobs you've applied for, including details like company, role, application date, and status (e.g., Applied, Interviewing, Offer, Rejected).
*   **Conversation Log:** Keep a record of all your conversations with recruiters, hiring managers, and network contacts.
*   **Todo List:** A task manager to keep track of important actions like following up on applications, preparing for interviews, or reaching out to contacts.

## 3. Clever Features to Boost Your Job Hunt

*   **Networking Hub:** A dedicated space to manage your professional contacts, track your networking outreach, and nurture relationships.
*   **Company Insights:** A section within each job application to store research, notes, and key information about the company, helping you tailor your applications and prepare for interviews.
*   **Interview Prep Zone:** A space to practice common interview questions and save your responses, ensuring you're always ready to impress.
*   **Resume & Cover Letter Tailoring:** A tool to help you customize your application materials for each specific job, increasing your chances of getting noticed.
*   **Smart Analytics:** Visualizations and stats to track your job search progress, such as applications per week, response rates, and interview success rates.

## 4. Tech Stack

*   **Frontend:** React
*   **Component Library:** Material-UI (MUI)
*   **Routing:** React Router
*   **State Management:** React Hooks (useState, useContext), potentially Zustand for more complex state.
*   **Persistence:** LocalStorage (for now)

## 5. Development Plan

### Phase 1: Basic Structure & Navigation (In Progress)

*   [x] Create `blueprint.md` file.
*   [ ] Install necessary packages (`@mui/material`, `@emotion/react`, `@emotion/styled`, `react-router-dom`).
*   [ ] Set up basic routing in `src/App.jsx`.
*   [ ] Create a `components` folder.
*   [ ] Create a `Navbar.jsx` component.
*   [ ] Create a `pages` folder.
*   [ ] Create placeholder page components: `Jobs.jsx`, `Conversations.jsx`, `Todos.jsx`, `Networking.jsx`.
*   [ ] Update `src/App.jsx` to render the `Navbar` and the page components within the routes.
