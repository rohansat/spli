# SPLI - Space Portal Licensing Interface

A comprehensive web application for managing FAA Part 450 license applications with AI assistance.

## Features

- **Part 450 Application Management**: Complete form handling for FAA license applications
- **AI-Powered Assistance**: Intelligent form filling and analysis
- **Document Management**: Upload and organize application documents
- **Email Integration**: Send applications to FAA officials with PDF attachments
- **Real-time Collaboration**: AI chat and form assistance

## Email Configuration

The application uses Azure AD authentication with Microsoft Graph API for email functionality. Users can send emails directly from their Outlook accounts without any additional configuration.

### Azure AD Setup:
1. **Azure AD App Registration**:
   - Create an app registration in Azure AD
   - Configure redirect URIs for your domain
   - Set required permissions: `Mail.Read`, `Mail.Send`, `User.Read`

2. **Environment Variables**:
   Create a `.env.local` file in the root directory and add:
   ```
   AZURE_AD_CLIENT_ID=your_azure_ad_client_id
   AZURE_AD_CLIENT_SECRET=your_azure_ad_client_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-domain.com
   ```

### How Email Works:
- Users sign in with their Outlook accounts
- Emails are sent directly from their authenticated Outlook account
- No manual email verification required
- PDF attachments are automatically generated and included
- Emails are saved to the user's Sent Items folder

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Firebase
- SendGrid
- Anthropic Claude AI
- jsPDF for PDF generation
