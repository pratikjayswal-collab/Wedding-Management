# 💒 Wedding Management System

A comprehensive MERN stack application for managing wedding planning tasks, guest lists, expenses, and requirements.

## 🚀 Features

### 🔐 Authentication
- User registration and login with email/password
- JWT-based authentication
- Protected routes and secure API endpoints

### 👥 Guest Management
- Add guests with name and contact information
- Manage guest status (confirmed/pending)
- Track invitation status
- Add and manage guest members
- Bulk actions for invitations and deletions
- Search and filter functionality

### 💰 Expense Management
- Create expense categories with budgets
- Add individual expense items
- Track spending vs. budget
- Interactive charts (Pie chart by category, Bar chart by budget vs. spent)
- Visual progress indicators

### ✅ Requirements & Tasks
- Create and manage wedding planning tasks
- Set priorities (low, medium, high)
- Track task status (pending/done)
- Categorize tasks
- Set due dates
- Bulk status updates

### 📱 Mobile-First Design
- Responsive design optimized for mobile devices
- Bottom tab navigation on mobile
- Sidebar navigation on desktop/tablet
- Elegant glassmorphism UI with pastel wedding colors

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling and responsive design
- **Redux Toolkit** for state management
- **React Router DOM** for navigation
- **Axios** for API communication
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

## 📁 Project Structure

```
wedding-management/
├── wedding-management-frontend/     # React frontend
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── auth/              # Authentication components
│   │   │   ├── guests/            # Guest management components
│   │   │   └── ...                # Other component categories
│   │   ├── store/                 # Redux store and slices
│   │   ├── services/              # API service functions
│   │   └── App.jsx               # Main app component
│   └── package.json
├── wedding-management-backend/      # Node.js backend
│   ├── src/
│   │   ├── controllers/           # Route controllers
│   │   ├── models/                # Mongoose schemas
│   │   ├── routes/                # API routes
│   │   ├── middleware/            # Custom middleware
│   │   └── index.js              # Server entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd wedding-management-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/wedding-management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd wedding-management-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)

### Guest Management
- `GET /api/guests` - Get all guests (protected)
- `POST /api/guests` - Create new guest (protected)
- `PUT /api/guests/:id` - Update guest (protected)
- `DELETE /api/guests/:id` - Delete guest (protected)
- `PATCH /api/guests/:id/invitation` - Toggle invitation status (protected)
- `PATCH /api/guests/bulk-invitation` - Bulk update invitations (protected)

### Expense Management
- `GET /api/expenses` - Get all expenses (protected)
- `POST /api/expenses` - Create expense category (protected)
- `PUT /api/expenses/:id` - Update expense (protected)
- `DELETE /api/expenses/:id` - Delete expense (protected)
- `POST /api/expenses/:id/items` - Add expense item (protected)
- `GET /api/expenses/chart-data` - Get chart data (protected)

### Requirements Management
- `GET /api/requirements` - Get all requirements (protected)
- `POST /api/requirements` - Create requirement (protected)
- `PUT /api/requirements/:id` - Update requirement (protected)
- `DELETE /api/requirements/:id` - Delete requirement (protected)
- `PATCH /api/requirements/:id/status` - Toggle status (protected)
- `PATCH /api/requirements/bulk-status` - Bulk status update (protected)

## 🎨 UI Components

### Core Components
- **Dashboard**: Main layout with tab/sidebar navigation
- **GuestCard**: Individual guest display with member toggle
- **AddGuestModal**: Modal for adding new guests
- **ExpensesTab**: Expense management with charts
- **RequirementsTab**: Task management with bulk actions
- **ProfileTab**: User profile and settings

### Design Features
- Glassmorphism cards with subtle shadows
- Pastel wedding color palette (rose, pink, cream)
- Smooth animations and transitions
- Mobile-first responsive design
- Interactive charts and visualizations

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## 📱 Mobile Responsiveness

- Bottom tab navigation on mobile devices
- Responsive grid layouts
- Touch-friendly interface elements
- Optimized for small screens
- Sidebar navigation on larger devices

## 🚀 Deployment

### Backend Deployment
- Set up MongoDB Atlas or cloud MongoDB instance
- Update `.env` with production values
- Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
- Build the production version: `npm run build`
- Deploy to platforms like Vercel, Netlify, or GitHub Pages
- Update API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ for wedding planning
- Uses modern web technologies for optimal performance
- Designed with mobile-first approach for convenience

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Happy Wedding Planning! 💕**
