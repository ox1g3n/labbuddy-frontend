# LabBuddy Frontend

A modern, React-based frontend application for LabBuddy - your intelligent laboratory assistant.

## 🚀 Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Code Editor:** Monaco Editor
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **UI Components:**
  - React Icons
  - React Markdown
  - React Hot Toast
  - React Toastify
- **PDF Generation:** html2pdf.js

## 🛠️ Development Setup

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd labbuddy-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add necessary environment variables.

### Available Scripts

- **Development server:**
  ```bash
  npm run dev
  ```
  Starts the development server with hot-reload at localhost

- **Build for production:**
  ```bash
  npm run build
  ```
  Creates an optimized production build in the `dist` directory

- **Lint code:**
  ```bash
  npm run lint
  ```
  Runs ESLint to check for code quality and style issues

- **Preview production build:**
  ```bash
  npm run preview
  ```
  Locally preview the production build

## 📁 Detailed Folder Structure

```
labbuddy-frontend/
├── public/           # Static assets
├── src/
│   ├── assets/      # Project assets (images, fonts, etc.)
│   ├── components/  # Reusable React components
│   │   └── ProtectedRoute.jsx  # Authentication route wrapper
│   ├── pages/       # Application pages/routes
│   │   ├── Dashboard.jsx     # Main dashboard interface
│   │   ├── Login.jsx        # User authentication
│   │   ├── Notebooks.jsx    # Notebook management
│   │   ├── Signup.jsx       # User registration
│   │   ├── Snippet.jsx      # Code snippet handling
│   │   ├── SnippetList.jsx  # List of code snippets
│   │   ├── SnippetModal.jsx # Snippet creation/editing
│   │   └── Suggestions.jsx  # AI suggestions interface
│   ├── App.jsx      # Main application component
│   ├── App.css      # Global styles
│   ├── index.css    # Base styles and Tailwind imports
│   └── main.jsx     # Application entry point
├── .env             # Environment variables
├── .gitignore       # Git ignore rules
├── index.html       # HTML entry point
├── package.json     # Project dependencies and scripts
├── postcss.config.js # PostCSS configuration
├── tailwind.config.js # Tailwind CSS configuration
├── vite.config.js   # Vite configuration
└── vercel.json      # Vercel deployment configuration
```

## 🔌 API Integration

The frontend interacts with the backend through the following API endpoints:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Notebooks
- `GET /api/notebooks` - Fetch all notebooks
- `POST /api/notebooks` - Create new notebook
- Operations on specific notebooks:
  - Update notebook content
  - Share notebook
  - Export notebook
  - Delete notebook

### Code Snippets
- `GET /api/snippets` - Fetch all code snippets
- `POST /api/snippets` - Create new code snippet
- Operations on specific snippets:
  - Update snippet
  - Delete snippet

### AI Suggestions
- `GET /api/suggestions` - Get AI-powered suggestions
- `POST /api/suggestions` - Submit code for AI analysis

### API Configuration
The application uses Axios for API requests. All API calls include:
- Authentication headers
- Error handling
- Loading states
- Toast notifications for success/error feedback

### Environment Variables
Required environment variables for API integration:
```
VITE_API_BASE_URL=your_api_base_url
```

## 🔧 Configuration

- **ESLint:** Configured with React-specific rules for code quality
- **PostCSS:** Set up with Tailwind CSS for modern CSS processing
- **Vite:** Optimized build tool configuration for fast development
- **Vercel:** Deployment configuration for seamless hosting

## 🌟 Features

- Modern React development with Vite
- Fast Refresh for quick development iterations
- Responsive design with Tailwind CSS
- Code editing capabilities with Monaco Editor
- PDF generation functionality
- Toast notifications for better user feedback
- Markdown support for content rendering
- Optimized production builds

## 📝 License

This project is licensed under the terms of the license included in the repository.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
