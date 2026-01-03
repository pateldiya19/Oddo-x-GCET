# DayFlow Frontend

A modern employee management system built with React, TypeScript, and Vite.

## 🚀 Features

- **Employee Dashboard** - Comprehensive employee overview and management
- **Admin Dashboard** - Administrative controls and analytics
- **Attendance Tracking** - Real-time attendance monitoring
- **Leave Management** - Request and approve leave applications
- **Payroll** - Salary and payment management
- **Reports** - Generate and view various reports
- **User Profiles** - Personal profile management
- **Authentication** - Secure sign-in and sign-up

## 🛠️ Tech Stack

- **React 18.3.1** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Router DOM** - Client-side routing
- **Material-UI** - Component library
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Lucide React** - Icon library

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/          # UI component library
│   │   │   ├── figma/       # Figma-exported components
│   │   │   └── TopNavbar.tsx
│   │   ├── context/         # React context providers
│   │   ├── data/            # Mock data and constants
│   │   ├── pages/           # Application pages
│   │   └── App.tsx          # Main app component
│   ├── styles/              # Global styles and fonts
│   └── main.tsx             # Application entry point
├── guidelines/              # Development guidelines
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── postcss.config.mjs       # PostCSS configuration
└── package.json             # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd temp/frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production

## 🎨 UI Components

The project includes a comprehensive library of pre-built UI components based on Radix UI:

- Accordion, Alert, Alert Dialog
- Avatar, Badge, Breadcrumb
- Button, Calendar, Card
- Carousel, Chart, Checkbox
- Command, Context Menu, Dialog
- Drawer, Dropdown Menu, Form
- Hover Card, Input, Label
- Menubar, Navigation Menu, Pagination
- Popover, Progress, Radio Group
- Resizable, Scroll Area, Select
- Separator, Sheet, Sidebar
- Skeleton, Slider, Switch
- Table, Tabs, Textarea
- Toggle, Tooltip

## 📄 Pages

- **Sign In** - User authentication
- **Sign Up** - New user registration
- **Employee Dashboard** - Employee view
- **Admin Dashboard** - Administrator view
- **Attendance** - Attendance tracking
- **Leave Management** - Leave requests
- **Payroll** - Salary management
- **Profile** - User profile
- **Reports** - Analytics and reports

## 🔐 Authentication

The application uses context-based authentication with `AuthContext` to manage user sessions and protected routes.

## 🎯 Development Guidelines

Refer to the [guidelines documentation](guidelines/Guidelines.md) for coding standards and best practices.

## 📦 Build

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and not licensed for public use.

## 👥 Team

Developed by the DayFlow team.

---

Built with ❤️ using React and TypeScript
