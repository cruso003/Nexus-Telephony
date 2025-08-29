# NexusAI Telephony API Documentation

## Overview

NexusAI Telephony is "The Twilio for Africa" - an AI-powered, developer-friendly telephony platform built specifically for African markets and the global African diaspora.

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/nexus-telephony.git
cd nexus-telephony

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Basic Usage

```javascript
const NexusAI = require('nexusai-telephony');

const nexus = new NexusAI({
  apiKey: 'your-api-key',
  region: 'africa-west' // Lagos data center
});

// Make a call
const call = await nexus.calls.create({
  to: '+234801234567',
  from: '+234700000000',
  url: 'https://your-app.com/voice-handler'
});
```

## API Endpoints

### Authentication

#### Register Account
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "developer@example.com",
  "password": "securepassword123",
  "friendlyName": "My Account"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "developer@example.com",
  "password": "securepassword123"
}
```

### Voice Calls

#### Create Call
```http
POST /api/v1/accounts/{accountSid}/calls
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "To": "+234801234567",
  "From": "+234700000000",
  "Url": "https://your-app.com/voice-handler"
}
```

#### Twilio Compatibility
```http
POST /2010-04-01/Accounts/{accountSid}/Calls
Authorization: Basic {base64(accountSid:authToken)}
Content-Type: application/json

{
  "To": "+234801234567",
  "From": "+234700000000",
  "Url": "https://your-app.com/voice-handler"
}
```

## African Market Features

### Intelligent Pricing

NexusAI automatically detects call destinations and applies appropriate African market pricing:

- **Local calls** (same country): $0.001/minute
- **Inter-African calls**: $0.002/minute  
- **International calls**: $0.003/minute

### Supported Countries (Phase 1)

- 🇳🇬 **Nigeria**: MTN, Airtel, Glo, 9mobile
- 🇰🇪 **Kenya**: Safaricom, Airtel
- 🇬🇭 **Ghana**: MTN, AirtelTigo, Vodafone
- 🇺🇬 **Uganda**: MTN, Airtel
- 🇷🇼 **Rwanda**: MTN, Airtel
- 🇱🇷 **Liberia**: Lonestar, Orange

### Country Code Detection

The API automatically detects African countries from phone numbers and optimizes routing:

```javascript
// Nigeria to Kenya call - Inter-African pricing
{
  "To": "+254700123456",    // Kenya
  "From": "+234700000000",  // Nigeria
  // Rate: $0.002/minute
}

// Within Nigeria - Local pricing
{
  "To": "+234801234567",    // Nigeria
  "From": "+234700000000",  // Nigeria  
  // Rate: $0.001/minute
}
```

## Development

### Project Structure

```
src/
├── app.ts              # Express application setup
├── index.ts            # Server entry point
├── config/             # Configuration management
├── controllers/        # Request handlers
├── middleware/         # Custom middleware
├── models/            # Data models
├── routes/            # API routes
├── services/          # Business logic
├── types/             # TypeScript definitions
└── utils/             # Helper functions

tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
└── e2e/              # End-to-end tests
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm test         # Run tests
npm run lint     # Run linter
npm run format   # Format code
```

### Environment Variables

See `.env.example` for all available configuration options.

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional additional details
  }
}
```

## Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_ERROR` - Authentication required or failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND_ERROR` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Monitoring and Logging

The API includes structured logging and monitoring:

- **Health Check**: `GET /health`
- **Logs**: Structured JSON logs with Winston
- **Metrics**: Request/response metrics
- **Error Tracking**: Comprehensive error logging

## Deployment

### Docker Support

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
EXPOSE 3000

CMD ["npm", "start"]
```

### Regional Deployment

The platform supports multi-region deployment:

- **Primary**: Lagos, Nigeria (africa-west)
- **Secondary**: Nairobi, Kenya (africa-east)
- **Tertiary**: Cape Town, South Africa (africa-south)

## Migration from Twilio

NexusAI provides 90% API compatibility with Twilio:

```bash
# Simple find and replace
# From: api.twilio.com/2010-04-01
# To: api.nexusai.africa/v1

# Or use compatibility endpoints
# Twilio: https://api.twilio.com/2010-04-01/Accounts/{Sid}/Calls
# NexusAI: https://api.nexusai.africa/2010-04-01/Accounts/{Sid}/Calls
```

## Support

- **Documentation**: https://docs.nexusai.africa
- **Support**: https://support.nexusai.africa
- **Status Page**: https://status.nexusai.africa
- **Community**: https://community.nexusai.africa

## License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for Africa by BITS (Building Innovative Technical Solutions)**