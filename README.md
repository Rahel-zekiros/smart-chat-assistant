# Smart Chat Assistant

A full-stack AI-powered chat application that provides a conversational interface for users to interact with an AI assistant. The project includes a React frontend, an Express.js backend, user authentication, chat functionality, and AI-powered features.

## Features

- **User Authentication:** Register and log in to an account.
- **AI Chat:** Send messages and receive AI-generated responses.
- **Conversation Management:** Store and retrieve chat messages.
- **AI Image Generation:** Image-generation functionality through the configured image service.
- **Database Integration:** Store user and conversation data in a MySQL-compatible database.
- **Responsive Interface:** Interact with the application through a web-based user interface.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Axios
- CSS

### Backend
- Node.js
- Express.js
- REST API
- JSON Web Token (JWT) authentication

### Database and AI Services
- MySQL-compatible database (TiDB Cloud)
- Google Gemini API
- Pollinations image-generation service

## Project Structure

```text
ChatgptCloen/
├── Backend/
│   ├── Config/
│   ├── Controllers/
│   ├── Routes/
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

*Note: The folder structure above is a simplified overview. Update it if your actual project structure differs.*

## Getting Started

### Prerequisites

- Node.js and npm
- Access to a MySQL-compatible database
- API credentials for the AI services used by the project

### 1. Clone the Repository

```bash
git clone https://github.com/Rahel-zekiros/smart-chat-assistant.git
cd smart-chat-assistant
```

### 2. Configure the Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the backend directory and configure the environment variables required by your backend.

Example variable names:

```env
PORT=3000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
POLLINATIONS_API_KEY=your_pollinations_api_key
```

Replace the example values with your own credentials. Check the backend source code to confirm the exact environment variable names required by your application.

Start the backend using the appropriate script defined in `Backend/package.json`.

### 3. Configure the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a frontend `.env` file containing the backend API base URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the frontend using the appropriate script defined in `frontend/package.json`.

### 4. Open the Application

Open the local frontend URL printed in the terminal, commonly:

```text
http://localhost:5173
```

Ensure the backend and database are running and correctly configured.

## Environment Variables

Do not commit `.env` files, passwords, authentication secrets, or private API keys to GitHub.

For production deployment, configure environment variables in the hosting provider's dashboard. Update `VITE_API_BASE_URL` to the deployed backend API URL.

## Deployment

- **Live Application:** Add the deployed frontend URL here.
- **Backend API:** Add the deployed backend URL here.
- **GitHub Repository:** https://github.com/Rahel-zekiros/smart-chat-assistant

The application is ready for public evaluation only after the frontend and backend have been deployed and tested successfully.

## Future Improvements

- Improve conversation organization and history management.
- Enhance error handling and loading states.
- Add more AI-assisted features.
- Improve accessibility and responsive design.

## Author

Rahel Zekiros

## License

Add a license if you intend to distribute this project under an open-source license.