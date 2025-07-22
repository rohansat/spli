# SPLI - Space Portal Licensing Interface

A comprehensive web application for managing FAA Part 450 license applications with AI assistance.

## Features

- **Part 450 Application Management**: Complete form handling for FAA license applications
- **AI-Powered Assistance**: Intelligent form filling and analysis
- **Document Management**: Upload and organize application documents
- **Email Integration**: Send applications to FAA officials with PDF attachments
- **Real-time Collaboration**: AI chat and form assistance

## Email Configuration

To enable real email sending functionality, you need to configure SendGrid:

1. **Get SendGrid API Key**:
   - Sign up at [SendGrid](https://sendgrid.com/)
   - Create an API key in your SendGrid dashboard
   - Copy the API key

2. **Set Environment Variable**:
   Create a `.env.local` file in the root directory and add:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   ```

3. **Verify Sender Email**:
   - In SendGrid, verify your sender email address
   - This will be the "from" address for emails

**Note**: Without the SendGrid API key, the email functionality will work in simulation mode for development purposes.

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
