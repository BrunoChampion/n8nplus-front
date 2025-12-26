Here’s a **frontend README** that mirrors the backend one, adapted for a **Next.js** app and consistent in tone and structure:

---

# n8n+ Frontend

Frontend web application for **n8n+**, built with **Next.js**, that provides a **user-friendly interface to interact with n8n workflows**.
Through this UI, users can **view, create, and update workflows**, while the frontend communicates with the **n8n+ backend API**, which in turn connects to an n8n instance.

> ⚠️ This frontend **requires the n8n+ backend to be running** in order to function correctly.

---

## 🧠 What is n8n+?

**n8n+** extends the capabilities of n8n by providing a modern web application where users can:

* View existing n8n workflows
* Create new workflows from scratch
* Update and manage workflows
* Interact with workflows using an intuitive UI instead of the raw n8n editor

---

## 🏗️ Architecture Overview

### Frontend (Next.js) → n8n+ Backend → n8n Instance

* **Frontend**: Web UI built with Next.js
* **Backend**: API layer that handles business logic and communication with n8n
* **n8n**: Automation engine where workflows are executed

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js (recommended: LTS)
* pnpm or npm
* A running **n8n+ backend**
* Git

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/BrunoChampion/n8nplus-front.git
cd n8nplus-front
```

Install dependencies:

```bash
pnpm install
# or
npm install
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root of the project:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> ⚠️ `NEXT_PUBLIC_API_URL` **must match the URL where the backend is running**, otherwise the app won’t be able to fetch or update workflows.

---

## ▶️ Running the Frontend

### Development

```bash
pnpm run dev
# or
npm run dev
```

The app will be available at:

```text
http://localhost:3000
```

### Production

```bash
pnpm run build
pnpm run start
# or
npm run build
npm run start
```

---

## 🔗 Backend Requirement

This frontend depends on the **n8n+ backend**.

* **Backend URL:** `http://localhost:3001`
* **Repository:** https://github.com/BrunoChampion/n8nplus-back.git

Make sure both services are running and can communicate with each other.

---

## 🛡️ Security Recommendations

* Use environment variables for all sensitive values
* Never expose private API keys without the `NEXT_PUBLIC_` prefix unless required server-side
* Restrict backend CORS to trusted frontend URLs

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions are welcome!
Feel free to open an issue or submit a pull request for improvements or fixes.

---

## 📬 Support

If you have questions or encounter issues, please open an issue in the repository.
