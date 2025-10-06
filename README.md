# YAROTECH Invoice Pro

A professional invoice management system built for YAROTECH Network Limited. This application allows you to create, manage, and email invoices with a beautiful PDF format.

## Features

- User authentication (signup/login)
- Customer management
- Product management
- Invoice generation with professional PDF output
- Automatic email delivery of invoices to info@yarotech.com.ng
- Sales history tracking
- Responsive design

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth
- **PDF Generation**: jsPDF
- **Email Service**: Resend API (via Supabase Edge Functions)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (already configured in this project)
- Resend API key (for email functionality)

## Local Development Setup

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env` file with Supabase credentials.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Email Configuration

To enable email functionality:

1. Sign up for a free account at [Resend](https://resend.com)
2. Get your API key from the Resend dashboard
3. Add the API key to your Supabase project:
   - Go to Supabase Dashboard
   - Navigate to Project Settings > Edge Functions > Secrets
   - Add a new secret: `RESEND_API_KEY` with your Resend API key

**Note**: The free Resend plan allows:
- 100 emails per day
- 3,000 emails per month
- Perfect for testing and small businesses

## Deployment Options

### Option 1: Vercel (Recommended for React Apps)

Vercel is the easiest and best option for deploying this React application.

**Steps:**

1. Create a free account at [Vercel](https://vercel.com)

2. Install Vercel CLI:
```bash
npm install -g vercel
```

3. Build the project:
```bash
npm run build
```

4. Deploy:
```bash
vercel
```

5. Follow the prompts to link your project

6. Set environment variables in Vercel:
   - Go to your project dashboard on Vercel
   - Navigate to Settings > Environment Variables
   - Add the following variables from your `.env` file:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

7. Your app will be live at `https://your-project.vercel.app`

**Custom Domain on Vercel:**
- Go to your project settings
- Navigate to Domains
- Add your custom domain
- Update your DNS records as instructed

---

### Option 2: Netlify

Another excellent free option for React applications.

**Steps:**

1. Create a free account at [Netlify](https://netlify.com)

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Build the project:
```bash
npm run build
```

4. Deploy:
```bash
netlify deploy --prod
```

5. Set environment variables:
   - Go to Site Settings > Environment Variables
   - Add your Supabase credentials

6. Your site will be live at `https://your-site.netlify.app`

---

### Option 3: cPanel Hosting (Traditional Web Hosting)

If you have traditional cPanel hosting, follow these steps:

**Important Limitations:**
- cPanel is designed for traditional server-side applications (PHP, etc.)
- React apps are client-side and can work, but with limitations
- The Supabase backend handles all server operations
- Edge Functions must be deployed separately to Supabase (not cPanel)

**Steps:**

1. Build the production version:
```bash
npm run build
```

2. The build creates a `dist` folder with all your static files

3. Compress the dist folder:
```bash
cd dist
zip -r ../yarotech-invoice.zip .
```

4. Upload to cPanel:
   - Log in to your cPanel
   - Go to File Manager
   - Navigate to `public_html` (or your domain's root folder)
   - Upload `yarotech-invoice.zip`
   - Extract the zip file
   - Delete the zip file

5. Configure `.htaccess` for React Router:

Create a `.htaccess` file in your public_html folder with:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

6. Environment Variables on cPanel:
   - Unfortunately, cPanel doesn't support environment variables for static sites
   - The Vite build process already includes the environment variables in the build
   - Make sure your `.env` file is properly configured before building

**⚠️ Security Note for cPanel:**
Since environment variables are baked into the build, your Supabase anonymous key will be in the JavaScript files. This is acceptable because:
- The anonymous key is meant to be public
- Row Level Security (RLS) in Supabase protects your data
- Never commit or expose your Supabase service role key

---

### Option 4: GitHub Pages (Free, but requires some setup)

**Steps:**

1. Update `vite.config.ts` to set the base URL:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

2. Build the project:
```bash
npm run build
```

3. Deploy using gh-pages:
```bash
npm install -g gh-pages
gh-pages -d dist
```

---

## Deployment Recommendation

**Best Options Ranked:**

1. **Vercel** - Best performance, easiest setup, free tier includes custom domains
2. **Netlify** - Great alternative to Vercel, equally easy
3. **GitHub Pages** - Free but requires more configuration
4. **cPanel** - Works but not ideal for React apps, best for traditional hosting situations

**For YAROTECH Invoice Pro, we recommend Vercel or Netlify** because they:
- Handle React routing automatically
- Provide free SSL certificates
- Offer excellent performance with CDN
- Support custom domains on free tier
- Are easier to update (just push to git)

## Edge Function Deployment

The email functionality requires the Supabase Edge Function to be deployed:

**The edge function is already created in your project** at:
- `supabase/functions/send-invoice-email/index.ts`

**To deploy it manually** (if needed):
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your-project-ref`
4. Deploy: `supabase functions deploy send-invoice-email`

## Database Setup

The database is already configured with:
- Customers table
- Products table
- Sales table
- Sale items table
- Row Level Security (RLS) policies

Migration file is available at:
`supabase/migrations/20251005055013_b905e069-0c02-45e0-bc12-06acccc4945f.sql`

## Usage

1. **Sign Up**: Create an account on the login page
2. **Add Customers**: Navigate to customer management (you may need to add this feature)
3. **Add Products**: Set up your product catalog
4. **Create Invoices**: Fill in the sales form with customer, products, and quantities
5. **Download/Email**: View sales history and download PDFs or email them to info@yarotech.com.ng

## Invoice Email Features

- Automatically sends invoice PDF to info@yarotech.com.ng
- Professional HTML email template
- Invoice details included in email body
- PDF attachment with YAROTECH branding

## Support and Contact

**YAROTECH Network Limited**
- Address: No. 122 Lukoro Plaza A, Farm Center, Kano State
- Email: info@yarotech.com.ng

## Troubleshooting

### Email not sending
- Check that RESEND_API_KEY is configured in Supabase Edge Function secrets
- Verify the edge function is deployed
- Check browser console for errors

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf dist && npm run build`

### Login issues
- Check Supabase connection in browser console
- Verify environment variables are set correctly

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## License

Proprietary - YAROTECH Network Limited

---

Built with ❤️ for YAROTECH Network Limited
