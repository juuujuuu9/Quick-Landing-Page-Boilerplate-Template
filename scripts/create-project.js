#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Creating new landing page project...\n');

// Get project name from command line arguments
const projectName = process.argv[2];
if (!projectName) {
  console.error('❌ Please provide a project name: node create-project.js <project-name>');
  process.exit(1);
}

const projectPath = join(process.cwd(), projectName);

// Create project directory
if (existsSync(projectPath)) {
  console.error(`❌ Directory ${projectName} already exists`);
  process.exit(1);
}

mkdirSync(projectPath, { recursive: true });
console.log(`✅ Created project directory: ${projectName}`);

// Copy template files
const templateFiles = [
  'package.json',
  'astro.config.mjs',
  'env.example',
  'tailwind.config.mjs',
  'tsconfig.json',
  'vercel.json',
  'README.md'
];

templateFiles.forEach(file => {
  const sourcePath = join(__dirname, '..', file);
  const destPath = join(projectPath, file);
  
  if (existsSync(sourcePath)) {
    copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied ${file}`);
  }
});

// Create src directory structure
const srcDirs = [
  'src/components',
  'src/layouts', 
  'src/lib',
  'src/pages/api',
  'src/styles',
  'public/assets',
  'public/fonts'
];

srcDirs.forEach(dir => {
  const fullPath = join(projectPath, dir);
  mkdirSync(fullPath, { recursive: true });
  console.log(`✅ Created directory: ${dir}`);
});

// Create basic source files
const sourceFiles = {
  'src/lib/database.ts': `import { Pool } from 'pg';

// Create a connection pool
const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Database schema interface
export interface Submission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(\`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT
      )
    \`);
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Create a new submission
export async function createSubmission(data: {
  name: string;
  email: string;
  phone: string;
  message?: string;
}): Promise<Submission> {
  const client = await pool.connect();
  try {
    const result = await client.query(\`
      INSERT INTO submissions (name, email, phone, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id::text, created_at::text, name, email, phone, message
    \`, [data.name, data.email, data.phone, data.message]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all submissions
export async function getAllSubmissions(): Promise<Submission[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(\`
      SELECT id::text, created_at::text, name, email, phone, message
      FROM submissions 
      ORDER BY created_at DESC
    \`);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Close the connection pool
export async function closeDatabase(): Promise<void> {
  await pool.end();
}`,

  'src/lib/email.ts': `import { Resend } from 'resend';
import type { Submission } from './database';

// Get API key with better error handling
const getApiKey = () => {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set in environment variables');
    return null;
  }
  if (!apiKey.startsWith('re_')) {
    console.error('RESEND_API_KEY appears to be invalid (should start with "re_")');
    return null;
  }
  return apiKey;
};

// Initialize Resend with API key
const apiKey = getApiKey();
const resend = apiKey ? new Resend(apiKey) : null;

// Admin email addresses from environment variables
const getAdminEmails = () => {
  const emails = [
    import.meta.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL_1,
    import.meta.env.ADMIN_EMAIL_2 || process.env.ADMIN_EMAIL_2,
    import.meta.env.ADMIN_EMAIL_3 || process.env.ADMIN_EMAIL_3,
    import.meta.env.ADMIN_EMAIL_4 || process.env.ADMIN_EMAIL_4
  ].filter(email => email && email.trim() !== '');
  
  console.log(\`Found \${emails.length} admin emails configured:\`, emails);
  return emails;
};

const ADMIN_EMAILS = getAdminEmails();

// Email template for admin notifications
function createAdminEmailTemplate(submission: Submission): string {
  return \`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        New Form Submission
      </h2>
      
      <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
        A new form submission has been received.
      </p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Submission Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">\${submission.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">\${submission.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">\${submission.phone}</td>
          </tr>
          \${submission.message ? \`
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Message:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">\${submission.message}</td>
          </tr>
          \` : ''}
        </table>
      </div>
      
      <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #666; font-size: 12px;">
          <strong>Submission ID:</strong> \${submission.id}<br>
          <strong>Submitted:</strong> \${new Date(submission.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  \`;
}

// Send email notification to all admins
export async function sendAdminNotification(submission: Submission): Promise<void> {
  try {
    if (!resend) {
      console.error('Resend is not properly configured. Check RESEND_API_KEY environment variable.');
      return;
    }
    
    if (ADMIN_EMAILS.length === 0) {
      console.error('No admin emails configured. Check ADMIN_EMAIL_1, ADMIN_EMAIL_2, ADMIN_EMAIL_3, ADMIN_EMAIL_4 environment variables.');
      return;
    }
    
    console.log(\`Attempting to send admin notifications for submission \${submission.id} to \${ADMIN_EMAILS.length} admins\`);
    
    const emailHtml = createAdminEmailTemplate(submission);
    
    // Send email to all admin addresses with rate limiting
    for (let i = 0; i < ADMIN_EMAILS.length; i++) {
      const adminEmail = ADMIN_EMAILS[i];
      try {
        const result = await resend.emails.send({
          from: \`\${import.meta.env.FROM_NAME || 'Your Company'} <\${import.meta.env.FROM_EMAIL || 'noreply@yourdomain.com'}>\`,
          to: [adminEmail],
          subject: \`New Form Submission - \${submission.name}\`,
          html: emailHtml,
        });
        console.log(\`Admin notification sent successfully to \${adminEmail}:\`, result);
        
        // Add delay between emails to respect rate limits
        if (i < ADMIN_EMAILS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay
        }
      } catch (emailError) {
        console.error(\`Failed to send admin notification to \${adminEmail}:\`, emailError);
      }
    }
    console.log(\`✅ Admin notification sent successfully to \${ADMIN_EMAILS.length} admins for submission \${submission.id}\`);
    
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
}`,

  'src/pages/api/signup.ts': `import type { APIRoute } from 'astro';
import { createSubmission, initializeDatabase } from '../../lib/database';
import { sendAdminNotification } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    const data = await request.json();
    
    // Debug: Log the received data
    console.log('Received form data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields', 
        missing: missingFields 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create submission
    const submission = await createSubmission({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message || ''
    });
    
    // Send email notifications
    console.log('New submission:', submission);
    await sendAdminNotification(submission);
    
    return new Response(JSON.stringify({ success: true, id: submission.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing signup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};`,

  'src/pages/index.astro': `---
import Layout from '../layouts/Layout.astro';
import ContactForm from '../components/ContactForm.astro';
---

<Layout title="Landing Page Template">
  <main class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-6">Welcome to Our Landing Page</h1>
        <p class="text-xl mb-8">Get started with our amazing service today!</p>
        <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Get Started
        </button>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-3xl font-bold text-center mb-8">Get in Touch</h2>
          <ContactForm />
        </div>
      </div>
    </section>
  </main>
</Layout>`,

  'src/layouts/Layout.astro': `---
export interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="Landing Page Template" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>`,

  'src/components/ContactForm.astro': `---
// Contact form component
---

<div class="bg-white p-8 rounded-lg shadow-lg">
  <form id="contact-form" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
        Full Name *
      </label>
      <input 
        type="text" 
        id="name" 
        name="name" 
        required 
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your full name"
      />
    </div>
    
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
        Email Address *
      </label>
      <input 
        type="email" 
        id="email" 
        name="email" 
        required 
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your email"
      />
    </div>
    
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
        Phone Number *
      </label>
      <input 
        type="tel" 
        id="phone" 
        name="phone" 
        required 
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your phone number"
      />
    </div>
    
    <div>
      <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
        Message
      </label>
      <textarea 
        id="message" 
        name="message" 
        rows="4"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your message (optional)"
      ></textarea>
    </div>
    
    <button 
      type="submit" 
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
    >
      Submit
    </button>
  </form>
  
  <div id="success-message" class="hidden mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
    <p class="font-medium">Thank you for your submission!</p>
    <p class="text-sm">We'll get back to you soon.</p>
  </div>
  
  <div id="error-message" class="hidden mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
    <p class="font-medium">Something went wrong.</p>
    <p class="text-sm">Please try again or contact us directly.</p>
  </div>
</div>

<script>
  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        successMessage?.classList.remove('hidden');
        errorMessage?.classList.add('hidden');
        form.reset();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.details || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      errorMessage?.classList.remove('hidden');
      successMessage?.classList.add('hidden');
    }
  });
</script>`
};

// Write all source files
Object.entries(sourceFiles).forEach(([path, content]) => {
  const fullPath = join(projectPath, path);
  writeFileSync(fullPath, content);
  console.log(`✅ Created ${path}`);
});

// Create .env file
const envPath = join(projectPath, '.env');
copyFileSync(join(__dirname, '..', 'env.example'), envPath);
console.log('✅ Created .env file from template');

console.log(`\n🎉 Project "${projectName}" created successfully!`);
console.log('\nNext steps:');
console.log(`1. cd ${projectName}`);
console.log('2. npm install');
console.log('3. Configure your .env file with your database and email settings');
console.log('4. npm run dev');
console.log('\nHappy coding! 🚀');
