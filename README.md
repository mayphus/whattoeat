# WhatToEat 🍽️

A modern meal planning and recipe management application built with React, TypeScript, and Cloudflare Workers.

## Features

- **Recipe Management**: Create, edit, and organize your favorite recipes
- **Meal Planning**: Track daily meals with portion sizes and notes  
- **Public Recipe Sharing**: Share recipes publicly and import others' recipes
- **Analytics**: View insights about your eating patterns and favorite recipes
- **Image Upload**: Add photos to your recipes with cloud storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building  
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful UI components
- **Clerk** for authentication
- **React Router** for navigation

### Backend  
- **Cloudflare Workers** for serverless API
- **Cloudflare D1** (SQLite) for database
- **Cloudflare R2** for image storage

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whattoeat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.dev.vars` file in the root directory:
   ```bash
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Set up Cloudflare resources**
   ```bash
   # Create D1 database
   wrangler d1 create whattoeat-db
   
   # Create R2 bucket  
   wrangler r2 bucket create whattoeat-images
   
   # Run database migrations
   wrangler d1 execute whattoeat-db --file=./schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Cloudflare

## Project Structure

```
├── src/                    # React frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── services/          # API service functions
│   ├── types/             # TypeScript type definitions
│   └── lib/               # Utility functions
├── worker/                # Cloudflare Worker source code
│   ├── index.ts           # Worker entry point
│   └── db.ts              # Database operations
├── migrations/            # Database migration files
├── schema.sql             # Database schema
├── TECHNICAL_DOCS.md      # Comprehensive technical documentation
└── public/                # Static assets
```

## API Documentation

The application provides a RESTful API with the following main endpoints:

- `GET/POST /api/recipes` - Manage user recipes
- `GET /api/public/recipes` - Browse public recipes  
- `GET/POST /api/meals` - Track daily meals
- `GET /api/analytics` - View eating analytics
- `POST /api/upload` - Upload recipe images

For detailed API documentation, see [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md).

## Database Schema

The application uses a clean, normalized database schema with two main tables:

- **recipes** - Store recipe information with user scoping
- **meals** - Track daily meal entries linked to recipes

Database migrations are managed through SQL files in the `/migrations` directory.

## Authentication

Authentication is handled by [Clerk](https://clerk.dev/), providing:
- Secure user registration and login
- Session management
- JWT token verification
- User data scoping

## Deployment

The application is designed for deployment on Cloudflare's edge network:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   ```

The deployment includes:
- Static frontend assets on Cloudflare Pages
- Serverless API on Cloudflare Workers  
- Database on Cloudflare D1
- Image storage on Cloudflare R2

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For technical details and architecture information, see [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md).
