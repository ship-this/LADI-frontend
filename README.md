# LADI Manuscript Evaluation System - Frontend

A modern React-based frontend for the LADI Manuscript Evaluation System, providing an intuitive interface for AI-powered manuscript analysis.

## Features

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Real-time Processing**: Live progress tracking during manuscript evaluation
- **Authentication**: Secure user authentication with JWT tokens
- **File Upload**: Drag-and-drop support for PDF and DOCX files
- **Evaluation Results**: 6 comprehensive evaluation categories with detailed scores
- **Download Reports**: Professional PDF report generation and download
- **History Management**: View and manage past evaluations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Native fetch API with custom service layer

## Evaluation Categories

The system evaluates manuscripts across 6 key dimensions:

1. **Line & Copy Editing**: Grammar, syntax, clarity, and prose fluidity
2. **Plot Evaluation**: Story structure, pacing, narrative tension, and resolution
3. **Character Evaluation**: Character depth, motivation, consistency, and emotional impact
4. **Book Flow Evaluation**: Rhythm, transitions, escalation patterns, and narrative cohesion
5. **Worldbuilding & Setting**: Setting depth, continuity, and originality
6. **LADI Readiness Score**: Overall readiness assessment with proprietary scoring

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

## Installation

1. **Clone the repository**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000/api
   
   # Development Configuration
   VITE_DEV_MODE=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:5173`

## Backend Integration

### API Endpoints

The frontend integrates with the following backend endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

#### Document Evaluation
- `POST /api/upload/evaluate` - Upload and evaluate document
- `GET /api/upload/evaluation/<id>` - Get evaluation results
- `GET /api/upload/evaluation/<id>/download` - Download evaluation report
- `GET /api/upload/evaluations` - Get user's evaluation history

#### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### API Service

The frontend uses a centralized API service (`src/services/api.ts`) that handles:

- **Authentication**: JWT token management and refresh
- **File Upload**: Multipart form data upload with progress tracking
- **Error Handling**: Consistent error handling and user feedback
- **Request/Response**: Type-safe API communication

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout components (Header, etc.)
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── assets/             # Static assets
├── public/                 # Public assets
├── env.example            # Environment configuration example
└── package.json           # Dependencies and scripts
```

## Key Components

### Dashboard (`src/pages/Dashboard.tsx`)
- Main application interface
- File upload with drag-and-drop
- Real-time progress tracking
- Evaluation results display
- PDF report download

### Authentication (`src/components/auth/`)
- Login and signup forms
- Form validation with React Hook Form
- Error handling and user feedback

### API Service (`src/services/api.ts`)
- Centralized API communication
- JWT token management
- File upload handling
- Error handling and retry logic

### Auth Context (`src/contexts/AuthContext.tsx`)
- User authentication state management
- Token persistence and refresh
- Evaluation history management

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Style

The project uses:
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type safety and IntelliSense

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_DEV_MODE` | Development mode flag | `true` |

## User Workflow

1. **Authentication**: Users sign up or log in to access the system
2. **File Upload**: Users upload PDF or DOCX manuscripts via drag-and-drop
3. **Processing**: Real-time progress tracking during AI evaluation
4. **Results**: View detailed evaluation scores across 6 categories
5. **Download**: Generate and download professional PDF reports
6. **History**: Access and manage past evaluations

## Error Handling

The application includes comprehensive error handling:

- **Network Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Automatic token refresh and re-authentication
- **File Upload Errors**: Clear error messages and validation
- **User Feedback**: Toast notifications for all user actions

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Token Refresh**: Automatic token refresh before expiration
- **Input Validation**: Client-side and server-side validation
- **CORS Handling**: Proper cross-origin request handling
- **Secure File Upload**: File type and size validation

## Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Caching**: API response caching with React Query
- **Optimized Builds**: Vite for fast development and optimized production builds

## Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Options

- **Vercel**: Zero-config deployment with automatic CI/CD
- **Netlify**: Drag-and-drop deployment with form handling
- **AWS S3 + CloudFront**: Static site hosting with CDN
- **Docker**: Containerized deployment

### Environment Configuration

For production deployment, ensure:

1. **API URL**: Set `VITE_API_URL` to your production backend URL
2. **HTTPS**: Use HTTPS in production for secure communication
3. **CORS**: Configure backend CORS to allow your frontend domain
4. **Environment Variables**: Set all required environment variables

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify backend is running on correct port
   - Check CORS configuration
   - Ensure environment variables are set correctly

2. **Authentication Issues**
   - Clear browser storage and re-authenticate
   - Check JWT token expiration
   - Verify backend authentication endpoints

3. **File Upload Problems**
   - Check file size limits (16MB max)
   - Verify supported file types (PDF, DOCX)
   - Ensure proper network connectivity

4. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check TypeScript configuration
   - Verify all environment variables are set

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Verify backend API is running and accessible
4. Check network tab for API request/response details

## License

This project is proprietary software for LADI Manuscript Evaluation System.
