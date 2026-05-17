# AtomicGoals
Built for AtomQuest Hackathon 1.0, this project is a modern web platform focused on workflow management, progress tracking, and role-based collaboration.

# Goal Setting & Tracking Portal

A modern full-stack web application built for **AtomQuest Hackathon 1.0** focused on structured workflow management, progress tracking, approvals, and organizational visibility.

The platform is designed to support role-based operations, collaborative workflows, periodic progress updates, and centralized reporting in a streamlined interface.

---

## Features

* Role-based authentication and access control
* Goal creation and tracking workflows
* Approval and review system
* Progress monitoring dashboards
* Analytics and reporting modules
* Responsive modern UI
* Real-time status visibility
* Structured workflow management

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* MongoDB
* Mongoose

### Additional Tools

* Framer Motion
* Recharts
* Nodemailer

---

## Getting Started

### Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
DB_NAME=your_database_name

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASS=your_password

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Build for production

```bash
npm run build
npm start
```

---

## Project Structure
```
src/
 ├── app/
 ├── components/
 ├── lib/
 ├── models/
 ├── utils/
 └── services/
```

---

## Performance Notes

This project includes:

* optimized watcher configuration
* dependency cleanup
* development performance improvements
* reduced indexing overhead for smoother local development

---

## Hackathon Context

This project was developed as part of **AtomQuest Hackathon 1.0** to explore scalable workflow management, progress tracking, and collaborative review systems in a modern web environment.

---

## License

This project is intended for educational and hackathon purposes.
