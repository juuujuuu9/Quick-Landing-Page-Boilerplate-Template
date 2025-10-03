# Quick Landing Page Boilerplate Template

A streamlined, production-ready template for rapidly deploying client landing pages with forms, database integration, and email notifications. Perfect for events, campaigns, and lead generation.

## 🚀 Tech Stack

- **[Astro](https://astro.build/)** - Modern static site generator with server-side rendering
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Resend](https://resend.com/)** - Modern email API for transactional emails
- **[Vercel](https://vercel.com/)** - Zero-config deployment platform

## ✨ Features

- 🎨 **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- 📝 **Form Handling** - Complete form validation and submission system
- 🗄️ **Database Integration** - PostgreSQL with connection pooling
- 📧 **Email Notifications** - Automated admin notifications via Resend
- 🔐 **Admin Dashboard** - Simple authentication and data management
- 📊 **Data Export** - CSV export functionality for submissions
- 🚀 **Zero-Config Deployment** - Deploy to Vercel with one click
- 📱 **Mobile Responsive** - Optimized for all device sizes
- ⚡ **Performance Optimized** - Fast loading with Astro's static generation

## 🛠️ Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/juuujuuu9/Quick-Landing-Page-Boilerplate-Template.git
cd Quick-Landing-Page-Boilerplate-Template

# Install dependencies
npm install

# Initialize project structure
npm run setup
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Admin Email Addresses
ADMIN_EMAIL_1=admin1@yourdomain.com
ADMIN_EMAIL_2=admin2@yourdomain.com
ADMIN_EMAIL_3=admin3@yourdomain.com
ADMIN_EMAIL_4=admin4@yourdomain.com

# Email Settings
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Company Name

# Site Configuration
SITE_URL=https://your-domain.vercel.app
```

### 3. Database Setup
The template includes automatic database schema initialization. Ensure your PostgreSQL database is accessible and the connection string is correct.

### 4. Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 5. Deployment
Deploy to Vercel with zero configuration:

1. Connect your GitHub repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Deploy automatically on every push

## 📁 Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── layouts/       # Page layouts
│   ├── lib/          # Database, email, and utility functions
│   ├── pages/        # Astro pages and API routes
│   │   └── api/      # API endpoints
│   └── styles/       # Global styles
├── public/           # Static assets
├── scripts/          # Setup and utility scripts
└── .cursorrules      # Cursor AI development rules
```

## 🔧 Configuration

### Database Schema
The template automatically creates the following table structure:
```sql
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT
);
```

### Email Templates
Customize email notifications in `src/lib/email.ts`. The template includes:
- HTML email templates
- Admin notification system
- Rate limiting for multiple recipients

### Form Fields
Modify form fields in `src/lib/database.ts` and `src/components/ContactForm.astro` to match your requirements.

## 🚨 Troubleshooting

### Vercel Deployment Issues
- **Error**: "Function Runtimes must have a valid version"
- **Solution**: The template uses proper Astro framework configuration in `vercel.json`

### Database Connection Issues
- **Error**: "Cannot read properties of undefined (reading 'searchParams')"
- **Solution**: Check DATABASE_URL format and SSL configuration

### Email Service Issues
- **Error**: "RESEND_API_KEY appears to be invalid"
- **Solution**: Ensure API key starts with 're_' and is properly set

### Common Setup Issues
- **Database Connection**: Always test connection before deployment
- **Email Configuration**: Verify Resend API key format (starts with 're_')
- **Environment Variables**: Ensure all required variables are set in Vercel dashboard
- **SSL Configuration**: Use SSL connections for production databases

## 🎨 Customization

### Styling
- Modify Tailwind classes in components
- Update color schemes in `tailwind.config.mjs`
- Add custom CSS in `src/styles/`

### Form Fields
- Update database schema in `src/lib/database.ts`
- Modify form validation in `src/components/ContactForm.astro`
- Add new fields to the submission interface

### Email Templates
- Customize HTML templates in `src/lib/email.ts`
- Update email content and styling
- Modify notification logic

### Pages
- Add new pages in `src/pages/`
- Create custom layouts in `src/layouts/`
- Implement additional API routes in `src/pages/api/`

## 📊 Admin Features

- **View Submissions**: See all form submissions in a clean interface
- **Export Data**: Download submissions as CSV files
- **Email Management**: Configure admin notification emails
- **Simple Authentication**: Basic admin login system

## 🔒 Security

- Input validation on both client and server
- SQL injection prevention with parameterized queries
- CORS configuration for API routes
- Environment variable protection
- HTTPS enforcement in production

## 🚀 Performance

- Static site generation with Astro
- Optimized images and assets
- Connection pooling for database
- Minimal JavaScript bundle
- CDN distribution via Vercel

## 📱 Mobile Optimization

- Responsive design with Tailwind CSS
- Touch-friendly form inputs
- Optimized images for mobile
- Fast loading on slow connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions

## 🎯 Use Cases

Perfect for:
- **Event Landing Pages** - Conference registrations, workshops
- **Lead Generation** - Product launches, service inquiries
- **Campaign Pages** - Marketing campaigns, promotions
- **Contact Forms** - Business inquiries, support requests
- **Newsletter Signups** - Email list building

## 🔄 Updates

This template is actively maintained with:
- Regular dependency updates
- Security patches
- Performance improvements
- New feature additions

---

**Built with ❤️ for rapid client deployment**

*Deploy your next landing page in minutes, not hours.*