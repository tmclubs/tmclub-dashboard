# TMC Frontend Web App

Toyota Manufacturers Club (TMC) Frontend Web Application built with React 18, Vite, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Bun** package manager
- **TMC Backend API** running on `http://localhost:1338`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tmc_frontend
```

2. Install dependencies:
```bash
./manage.sh install
```

3. Start development server:
```bash
./manage.sh dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📚 Available Scripts

Use the `manage.sh` script for easy project management:

### Package Management
```bash
./manage.sh install      # Install dependencies
./manage.sh clean        # Remove node_modules, dist, and caches
./manage.sh reset        # Clean project and reinstall dependencies
```

### Development
```bash
./manage.sh dev          # Start development server
./manage.sh dev --open   # Start dev server and open browser
```

### Build & Preview
```bash
./manage.sh build        # Build for production
./manage.sh preview      # Preview production build
```

### Code Quality
```bash
./manage.sh lint         # Run ESLint
./manage.sh lint:fix     # Run ESLint with auto-fix
./manage.sh format       # Format code with Prettier
./manage.sh type-check   # Run TypeScript type checking
```

### Information
```bash
./manage.sh status       # Show project status
./manage.sh help         # Show help message
```

## 🎨 Design System

### Color Palette
- **Primary**: Orange theme (`#f97316`)
- **Secondary**: Gray scale
- **Success**: Green (`#10b981`)
- **Error**: Red (`#ef4444`)

### Typography
- **Font Family**: Inter (system-ui fallback)
- **Headings**: Bold weights
- **Body**: Regular weights

### Components
- Built with **Tailwind CSS v4**
- **Headless UI** for accessible components
- **Framer Motion** for animations
- **Lucide React** for icons

## 🏗️ Project Structure

```
src/
├── components/              # Reusable components
│   ├── ui/                 # Base UI components
│   ├── layout/             # Layout components
│   ├── features/           # Feature-specific components
│   └── forms/              # Form components
├── pages/                  # Page components
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── lib/                    # Utilities and configurations
│   ├── api/               # API layer
│   ├── hooks/             # Custom hooks
│   ├── stores/            # Zustand stores
│   └── utils/             # Utility functions
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles
```

## 🔐 Authentication

### Demo Credentials
- **Email**: admin@tmc.id
- **Password**: password

### Google OAuth
Configure Google OAuth in your environment variables:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🌐 API Integration

The app is configured to work with the TMC Backend API:
- **Base URL**: `http://localhost:1338`
- **Authentication**: Token-based
- **Response Format**: Standardized with `{status, code, message, data, meta}`

### API Endpoints
- Authentication: `/authenticate/`
- Events: `/event/`
- Companies: `/company/`
- Surveys: `/survey/`
- And more... (see `docs/TMC_API_Complete_Collection.json`)

## 📱 Features

### Core Features
- ✅ **Authentication** - Login/Register with Google OAuth2
- ✅ **Dashboard** - Overview with statistics and quick actions
- 🚧 **Event Management** - CRUD events, QR scanning, certificates
- 🚧 **Company Management** - Corporate directory, member management
- 🚧 **Survey Builder** - Dynamic form builder with analytics
- 🚧 **Blog & Content** - CMS with rich text editor
- 🚧 **Notifications** - Real-time notification center

### Technical Features
- ✅ **TypeScript** - Full type safety
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **State Management** - Zustand + TanStack Query
- ✅ **Form Validation** - React Hook Form + Zod
- ✅ **Code Quality** - ESLint, Prettier, testing setup
- ✅ **Performance** - Code splitting, lazy loading

## 🔧 Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```env
# API Configuration
VITE_API_URL=http://localhost:1338
VITE_APP_URL=http://localhost:5173

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret

# App Configuration
VITE_APP_NAME=TMC Web App
VITE_APP_DESCRIPTION=Toyota Manufacturers Club - Community Management Platform
```

## 🐳 Docker Deployment

Build the Docker image:
```bash
docker build -t tmc-frontend .
```

Run the container:
```bash
docker run -p 5173:5173 tmc-frontend
```

## 🤝 Contributing

1. Follow the existing code style
2. Run `./manage.sh lint:fix` before committing
3. Add tests for new features
4. Update documentation as needed

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [Documentation](./docs/)
2. Run `./manage.sh status` to check project status
3. Ensure the backend API is running on `http://localhost:1338`
4. Check that all environment variables are properly set

## 🛣️ Roadmap

- [ ] Complete Event Management features
- [ ] Implement Company Management
- [ ] Build Survey Builder
- [ ] Add Blog & Content Management
- [ ] Implement real-time notifications
- [ ] Add testing suite
- [ ] Performance optimization
- [ ] Mobile app development

---

Built with ❤️ using React, Vite, TypeScript, and Tailwind CSS