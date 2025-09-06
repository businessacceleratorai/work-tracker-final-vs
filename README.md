# Work Tracker

A modern, full-stack productivity application built with Next.js, TypeScript, and PostgreSQL. Work Tracker helps you manage tasks, take notes, set reminders, and track time efficiently.

![Work Tracker](https://img.shields.io/badge/Next.js-13+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔐 Authentication System
- **Secure user registration and login**
- **JWT-based authentication**
- **Password hashing with bcryptjs**
- **Session management with HTTP-only cookies**

### 📝 Notes Management
- **Rich text editor** with formatting toolbar
- **Folder organization** for better note management
- **Real-time auto-save** functionality
- **Search and filter** capabilities
- **Drag-and-drop** note organization

### ✅ Task Management
- **Create, edit, and delete tasks**
- **Mark tasks as complete/incomplete**
- **Task categorization and filtering**
- **Due date tracking**

### ⏰ Time Tracking
- **Built-in timer functionality**
- **Time tracking for tasks and projects**
- **Historical time logs**

### 🔔 Reminders
- **Set custom reminders**
- **Notification system**
- **Recurring reminder options**

## 🚀 Tech Stack

### Frontend
- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Robust relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **node-postgres (pg)** - PostgreSQL client

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/businessacceleratorai/work-tracker-final-vs.git
   cd work-tracker-final-vs
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/work_tracker
   JWT_SECRET=your-super-secret-jwt-key
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb work_tracker
   
   # Run the SQL schema (see DEPLOYMENT.md for full schema)
   psql -d work_tracker -f database/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Vercel + Supabase (Recommended)

For detailed deployment instructions, see [VERCEL_SETUP.md](./VERCEL_SETUP.md).

**Quick Deploy:**
1. Fork this repository
2. Create a Supabase project and database
3. Connect your GitHub repo to Vercel
4. Set environment variables in Vercel
5. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/businessacceleratorai/work-tracker-final-vs)

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and authentication
- **folders** - Note organization folders
- **notes** - Rich text notes with folder association
- **tasks** - Task management with completion status
- **timers** - Time tracking records
- **reminders** - User reminders and notifications

For the complete database schema, see [VERCEL_SETUP.md](./VERCEL_SETUP.md#database-schema-setup).

## 🎯 Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Create folders** to organize your notes
3. **Add notes** with rich text formatting
4. **Create tasks** and track your progress
5. **Set reminders** for important deadlines
6. **Use timers** to track time spent on activities

### Key Features
- **Rich Text Editor**: Format your notes with bold, italic, headers, lists, and more
- **Folder Organization**: Keep your notes organized in custom folders
- **Auto-Save**: Your work is automatically saved as you type
- **Search**: Quickly find notes and tasks with the search functionality
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🔧 Development

### Project Structure
```
work-tracker/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── notes/            # Notes-related components
│   └── tasks/            # Task-related components
├── lib/                  # Utility functions
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database permissions

**Authentication Issues**
- Verify `JWT_SECRET` is set and secure
- Check cookie settings in production
- Ensure HTTPS is enabled in production

**Build Errors**
- Clear `.next` folder and rebuild
- Check Node.js version compatibility
- Verify all dependencies are installed

For more troubleshooting tips, see [VERCEL_SETUP.md](./VERCEL_SETUP.md#troubleshooting).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 Email: support@worktracker.com
- 🐛 Issues: [GitHub Issues](https://github.com/businessacceleratorai/work-tracker-final-vs/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/businessacceleratorai/work-tracker-final-vs/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful and accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Vercel](https://vercel.com/) - Platform for frontend frameworks and static sites

---

**Built with ❤️ by the Work Tracker team**
