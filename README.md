# Admin Command Center - Learning Management System

A full-stack learning management system with admin dashboard, course management, and student portal. Built with React, TypeScript, and Supabase.

Original Figma design: https://www.figma.com/design/rvzt12btITspAsOoXCNILI/Build-Admin-Command-Center

## 🚀 Features

### For Admins (manishkalyan141@gmail.com)
- **Course Management**: Create, edit, delete course hierarchy (Degree → Year → Subject → Chapter → Topic)
- **Content Management**: Upload videos (English/Hindi), PDFs, audio files, interactive content
- **Assessment Builder**: Create chapter quizzes with multiple choice questions
- **Pricing Control**: Set dynamic pricing per year with multi-currency support
- **User Analytics**: View all users, purchases, and progress
- **Real-time Sync**: All changes persist to Supabase database

### For Students (All Other Users)
- **Course Browser**: Navigate through structured curriculum
- **Free & Premium Content**: Access free content, purchase YEAR-based access for premium
- **Progress Tracking**: Mark topics complete, add private notes
- **Interactive Learning**: Watch videos, read PDFs, use interactive simulators
- **Chapter Assessments**: Take quizzes after completing chapters

## 🔧 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Gmail OAuth via Supabase Auth
- **State**: React hooks
- **Icons**: Lucide React

## 📦 Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Setup Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run `supabase_schema.sql` in SQL Editor
   - Enable Google OAuth in Authentication → Providers

3. **Configure environment variables**
```bash
# Edit .env with your Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Run development server**
```bash
npm run dev
```

## 📖 Documentation

See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed setup guide including:
- Complete database setup
- Gmail OAuth configuration
- Security policies
- Testing instructions

## 🗄️ Database Schema

The system uses 8 main tables:
- `profiles` - User accounts with role-based access
- `hierarchy_nodes` - Course structure tree
- `content_assets` - Media files for topics
- `assessments` & `assessment_questions` - Chapter quizzes
- `user_progress` - Completion tracking
- `course_purchases` - Payment records
- `pricing` - Dynamic pricing per year

All tables use Row Level Security (RLS) for data protection.

## 🔐 Security

- **Admin Role**: Only `manishkalyan141@gmail.com` has admin access
- **User Role**: All other emails are regular users
- **RLS Policies**: Database-level security ensures users can only access authorized data
- **OAuth**: Secure Gmail authentication via Supabase
- **Environment Variables**: Credentials stored in `.env` (not committed to git)

## 🎯 Usage

### As Admin
1. Sign in with `manishkalyan141@gmail.com`
2. Switch to "Admin View" in top navigation
3. Navigate through tabs:
   - **Analytics & Users**: View statistics and user list
   - **Course Manager**: Edit course structure and content
   - **Pricing & Plans**: Update pricing for each year

### As Student
1. Sign in with any other Gmail account
2. Browse courses in Student View
3. Click premium content to purchase YEAR access
4. Track progress and take assessments

## 🧪 Testing

### Test Admin Features
- Email: `manishkalyan141@gmail.com`
- Features: Full CRUD, pricing control, analytics

### Test User Features
- Email: Any other Gmail account
- Features: Browse, purchase, learn

---

Built with ❤️ using React, TypeScript, and Supabase