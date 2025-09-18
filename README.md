# AI Agents - Intelligent Ticket Management System

An intelligent support ticket management system powered by AI agents that automatically triage, prioritize, and assign tickets to appropriate moderators based on their skills and expertise.

## 🚀 Features

- **AI-Powered Ticket Triage**: Automatically analyzes support tickets using Google's Gemini AI
- **Smart Assignment**: Matches tickets to moderators based on their skills and expertise
- **Priority Classification**: AI determines ticket priority (low, medium, high)
- **Automated Notifications**: Email notifications for ticket assignments
- **Event-Driven Architecture**: Built with Inngest for reliable background processing
- **RESTful API**: Clean API endpoints for ticket and user management
- **Authentication**: JWT-based authentication system
- **Role-Based Access**: Support for users, moderators, and admins

## 🏗️ Architecture

The system uses an event-driven architecture with the following components:

- **Backend API**: Express.js server with MongoDB
- **AI Processing**: Google Gemini AI for ticket analysis
- **Event Processing**: Inngest for background job processing
- **Email Service**: Nodemailer for notifications
- **Authentication**: JWT tokens with bcrypt password hashing

## 📁 Project Structure

```
ai_agents/
├── backend/
│   ├── controller/          # Request handlers
│   │   ├── ticket.js       # Ticket operations
│   │   └── user.js         # User operations
│   ├── inngest/            # Event processing
│   │   ├── client.js       # Inngest client configuration
│   │   └── functions/      # Event handlers
│   │       ├── on-signup.js
│   │       └── on-ticket-create.js
│   ├── middlewares/        # Express middlewares
│   │   └── auth.js         # Authentication middleware
│   ├── models/             # MongoDB schemas
│   │   ├── ticket.js       # Ticket model
│   │   └── user.js         # User model
│   ├── routes/             # API routes
│   │   ├── ticket.js       # Ticket endpoints
│   │   └── user.js         # User endpoints
│   ├── utils/              # Utility functions
│   │   ├── ai.js           # AI ticket analysis
│   │   └── mailer.js       # Email service
│   ├── index.js            # Main server file
│   └── package.json        # Dependencies
├── frontend/               # Frontend application (React)
└── .gitignore             # Git ignore rules
```

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Inngest** - Event processing platform
- **Google Gemini AI** - AI ticket analysis
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service

### Frontend

- **React** - Frontend framework
- **Vite** - Build tool

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Google Gemini API key
- Email service credentials (for notifications)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai_agents
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the backend directory:

   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/ai_agents
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

5. **Start the development servers**

   Backend:

   ```bash
   cd backend
   npm run dev
   ```

   Frontend:

   ```bash
   cd frontend
   npm run dev
   ```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/update-user` - Update user profile
- `POST /api/auth/get-users` - Get all users

### Tickets

- `GET /api/ticket` - Get all tickets
- `GET /api/ticket/:id` - Get specific ticket
- `POST /api/ticket` - Create new ticket

### Inngest Events

- `POST /api/inngest` - Inngest webhook endpoint

## 🤖 AI Ticket Processing

When a new ticket is created, the system automatically:

1. **Analyzes the ticket** using Google Gemini AI
2. **Extracts key information**:
   - Summary of the issue
   - Priority level (low/medium/high)
   - Helpful notes for moderators
   - Required technical skills
3. **Assigns to appropriate moderator** based on skills match
4. **Sends email notification** to the assigned moderator

## 🔧 Configuration

### Inngest Setup

The system uses Inngest for event processing. Make sure to:

1. Set up an Inngest account
2. Configure the Inngest client in `backend/inngest/client.js`
3. Deploy the functions to your Inngest environment

### AI Configuration

The AI analysis is powered by Google's Gemini API:

1. Get your API key from Google AI Studio
2. Add it to your `.env` file as `GEMINI_API_KEY`
3. The system will automatically use it for ticket analysis

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📝 Environment Variables

| Variable         | Description                 | Required           |
| ---------------- | --------------------------- | ------------------ |
| `PORT`           | Server port                 | No (default: 4000) |
| `MONGO_URI`      | MongoDB connection string   | Yes                |
| `JWT_SECRET`     | JWT signing secret          | Yes                |
| `GEMINI_API_KEY` | Google Gemini API key       | Yes                |
| `EMAIL_HOST`     | SMTP host                   | Yes                |
| `EMAIL_PORT`     | SMTP port                   | Yes                |
| `EMAIL_USER`     | Email username              | Yes                |
| `EMAIL_PASS`     | Email password/app password | Yes                |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the existing issues
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Advanced AI models for better ticket analysis
- [ ] Ticket analytics dashboard
- [ ] Integration with external ticketing systems
- [ ] Mobile application
- [ ] Multi-language support
