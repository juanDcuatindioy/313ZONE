# 313 ZONE Bar Management System

This application is a complete bar management system for 313 ZONE, featuring inventory management, sales processing, and analytics.

## Features

- Complete inventory management
- Order processing with multiple payment methods
- Sales history and analytics
- Responsive design for use on various devices

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: MySQL

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database

### Database Setup

1. Create a MySQL database using the provided schema:

```bash
mysql -u root -p < database-schema.sql
```

2. Configure your database connection in the `.env` file

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the backend server:

```bash
npm run server
```

3. In a separate terminal, start the frontend development server:

```bash
npm run dev
```

## Project Structure

- `/src` - Frontend React application
  - `/components` - Reusable UI components
  - `/contexts` - React context providers
  - `/pages` - Application pages
  - `/types` - TypeScript type definitions
- `/server` - Backend API server
- `database-schema.sql` - Database schema with sample data

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Sales

- `GET /api/sales` - Get all sales with items
- `POST /api/sales` - Create a new sale

## License

This project is licensed under the MIT License.