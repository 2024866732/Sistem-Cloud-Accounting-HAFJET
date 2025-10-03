# Cloud Accounting System Malaysia - Copilot Instructions

## Project Overview
**HAFJET Cloud Accounting System** is a comprehensive cloud accounting system for Malaysia, providing modern, web-based accounting solutions tailored for Malaysian businesses. This enterprise-ready solution offers advanced features for financial management, compliance, and business intelligence.

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Charts/Reports**: Chart.js + React Chart.js 2
- **PDF Generation**: jsPDF + html2canvas
- **Date Handling**: date-fns
- **State Management**: Context API + Zustand

## Malaysian Accounting Requirements
1. **Tax Compliance**:
   - SST (Sales and Service Tax) 6%
   - GST historical data support
   - Withholding tax calculations

2. **E-Invoice Integration**:
   - LHDN e-Invoice API compatibility
   - XML invoice format support
   - Digital signature validation

3. **Currency Support**:
   - Primary: Malaysian Ringgit (MYR)
   - Multi-currency for international transactions
   - Real-time exchange rate integration

4. **Financial Reports**:
   - Profit & Loss Statement
   - Balance Sheet
   - Cash Flow Statement
   - Trial Balance
   - Aged Receivables/Payables

## Core Features
- **Dashboard**: Financial overview with charts and KPIs
- **Transactions**: Income, expenses, transfers
- **Invoicing**: Create, send, track invoices
- **Contacts**: Customers, suppliers, employees
- **Banking**: Bank account management and reconciliation
- **Reports**: Comprehensive financial reporting
- **Settings**: Company profile, tax settings, user management

## File Structure
```
/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── stores/         # State management
│   ├── public/
│   └── package.json
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── utils/          # Backend utilities
│   └── package.json
├── shared/                  # Shared types and utilities
├── docs/                   # Documentation
└── README.md
```

## Development Guidelines
1. **TypeScript**: Use strict mode, proper typing for all functions
2. **Components**: Follow compound component pattern for complex UI
3. **API**: RESTful design with proper error handling
4. **Security**: Input validation, SQL injection prevention, XSS protection
5. **Performance**: Code splitting, lazy loading, optimized queries
6. **Testing**: Unit tests for utilities, integration tests for API
7. **Accessibility**: WCAG 2.1 AA compliance
8. **Internationalization**: Support for English and Bahasa Malaysia

## Environment Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `LHDN_API_KEY`: LHDN e-Invoice API key
- `EXCHANGE_RATE_API`: Currency exchange rate API
- `EMAIL_SERVICE`: Email service configuration

## Commands
- `npm run dev`: Start development servers (frontend + backend)
- `npm run build`: Build production bundles
- `npm run test`: Run test suites
- `npm run lint`: Run ESLint and Prettier
- `npm run db:seed`: Seed database with sample data

## Coding Standards
- Use functional components with hooks
- Implement proper error boundaries
- Follow REST API conventions
- Use consistent naming conventions (camelCase for JS, kebab-case for CSS)
- Write meaningful commit messages
- Document complex business logic

## Malaysian Business Context
- Understand local accounting practices
- Support RM currency formatting
- Include Malaysian public holidays
- Comply with SSM (Companies Commission of Malaysia) requirements
- Support both SME and enterprise accounting needs