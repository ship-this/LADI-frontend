# LADI Frontend

A modern React-based frontend for the Literary Analysis and Development Interface (LADI) platform. This frontend provides an intuitive user interface for manuscript evaluation, template management, and user profile management.

## Features

### Core Functionality
- **User Authentication**: Secure login and registration system
- **Dashboard**: Centralized navigation and project overview
- **Document Upload**: Drag-and-drop file upload with progress tracking
- **Evaluation Management**: Multiple evaluation methods and template selection
- **Report Generation**: Download evaluation reports in PDF format
- **Real-time Feedback**: Progress indicators and toast notifications

### Evaluation Features
- **Basic Evaluation**: Standard AI-powered manuscript analysis
- **Template Evaluation**: Custom evaluation using uploaded templates
- **Multi-Method Evaluation**: Combine basic and template-based evaluations
- **Template Management**: Upload, edit, and manage evaluation templates
- **Evaluation History**: View and download past evaluations

### User Management
- **Profile Management**: Update personal information and credentials
- **Password Management**: Secure password change functionality
- **Account Management**: Account deletion with confirmation
- **Session Management**: Automatic token refresh and logout

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface using Shadcn UI components
- **Dark/Light Mode**: Theme support (if implemented)
- **Accessibility**: WCAG compliant design patterns
- **Loading States**: Comprehensive loading indicators and skeleton screens

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API with AbortController
- **Form Handling**: React Hook Form (if implemented)
- **Notifications**: Custom toast system
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── public/                     # Static assets
│   ├── index.html             # HTML template
│   └── favicon.ico            # Favicon
├── src/
│   ├── components/            # Reusable components
│   │   ├── ui/               # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/           # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── sidebar.tsx
│   │   └── enhanced-evaluation-upload.tsx
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── hooks/                # Custom React hooks
│   │   └── use-toast.ts      # Toast notification hook
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── Login.tsx         # Login page
│   │   ├── Register.tsx      # Registration page
│   │   ├── BasicEvaluation.tsx
│   │   ├── TemplateEvaluation.tsx
│   │   ├── TemplateManagement.tsx
│   │   ├── UserProfile.tsx
│   │   └── NotFound.tsx
│   ├── services/             # API services
│   │   └── api.ts           # API client
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── components.json          # Shadcn UI configuration
└── README.md               # This file
```

## Pages and Components

### Authentication Pages
- **Login**: User authentication with email/password
- **Register**: New user registration
- **Protected Routes**: Automatic redirect for unauthenticated users

### Main Pages
- **Dashboard**: Central hub with navigation cards
- **Basic Evaluation**: Simple manuscript evaluation interface
- **Template Evaluation**: Advanced evaluation with template selection
- **Template Management**: Upload and manage evaluation templates
- **User Profile**: Account settings and management

### Components
- **EnhancedEvaluationUpload**: Comprehensive file upload with progress tracking
- **Header**: Navigation and user menu
- **Toast Notifications**: User feedback system
- **Loading Spinners**: Progress indicators
- **Form Components**: Reusable form elements

## API Integration

### Authentication
- JWT token management
- Automatic token refresh
- Secure logout functionality
- Protected route handling

### File Upload
- Drag-and-drop interface
- File type validation
- Progress tracking
- Error handling

### Evaluation
- Multiple evaluation methods
- Template selection
- Real-time progress updates
- Result display and download

## Setup Instructions

### Prerequisites
- Node.js 16+
- npm or yarn package manager

### Quick Setup
1. **Clone the repository** (if not already done)
2. **Run the setup script** from the project root:
   ```bash
   # Unix/Linux/macOS
   ./setup.sh
   
   # Windows
   setup.bat
   ```

### Manual Setup
1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your API URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### Environment Configuration
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Development

### Available Scripts
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Style
- Use TypeScript for all components
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Add comprehensive prop types

### Component Guidelines
- Keep components small and focused
- Use meaningful component names
- Implement proper loading states
- Add error handling
- Use TypeScript interfaces for props

### State Management
- Use React Context for global state
- Keep local state in components
- Implement proper state updates
- Use useCallback and useMemo for optimization

## User Interface Guidelines

### Design System
- **Colors**: Consistent color palette using Tailwind CSS
- **Typography**: Clear hierarchy with readable fonts
- **Spacing**: Consistent spacing using Tailwind utilities
- **Components**: Reusable Shadcn UI components

### Responsive Design
- Mobile-first approach
- Breakpoint considerations
- Touch-friendly interfaces
- Flexible layouts

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## API Client

### Request Configuration
- Base URL configuration
- Request/response interceptors
- Error handling
- Timeout management
- Authentication headers

### Error Handling
- Network error handling
- API error responses
- User-friendly error messages
- Retry mechanisms
- Fallback states

## Performance Optimization

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Dynamic imports
- Bundle size optimization

### Caching
- API response caching
- Static asset caching
- Browser caching strategies
- Memory management

### Monitoring
- Performance metrics
- Error tracking
- User analytics
- Bundle analysis

## Testing

### Unit Testing
- Component testing with React Testing Library
- Hook testing
- Utility function testing
- Mock API responses

### Integration Testing
- User flow testing
- API integration testing
- Cross-browser testing
- Mobile device testing

### E2E Testing
- Critical user journeys
- Authentication flows
- File upload testing
- Error scenario testing

## Deployment

### Build Process
```bash
# Create production build
npm run build

# Preview build locally
npm run preview
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Container**: Docker with nginx
- **Server**: Apache, nginx

### Environment Variables
- Production API URLs
- Analytics configuration
- Feature flags
- Error tracking

## Troubleshooting

### Common Issues

1. **Build Errors**:
   - Check TypeScript errors
   - Verify all dependencies are installed
   - Clear node_modules and reinstall

2. **API Connection Issues**:
   - Verify API URL in .env
   - Check CORS configuration
   - Test API endpoints directly

3. **Authentication Issues**:
   - Check JWT token storage
   - Verify token expiration
   - Clear browser storage

4. **File Upload Issues**:
   - Check file size limits
   - Verify file type support
   - Test with different browsers

### Debug Tools
- React Developer Tools
- Network tab for API calls
- Console for error messages
- Performance profiling

## Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit pull request

### Code Review
- TypeScript compliance
- Component structure
- Error handling
- Performance considerations
- Accessibility compliance

### Documentation
- Update README for new features
- Add component documentation
- Update API documentation
- Include usage examples

## Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Mobile

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## Security Considerations

- **XSS Prevention**: Proper input sanitization
- **CSRF Protection**: Token-based protection
- **Content Security Policy**: CSP headers
- **Secure Headers**: HTTPS enforcement
- **Input Validation**: Client-side validation

## License

This project is part of the LADI platform. See the main project README for license information.
