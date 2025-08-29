import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  api_version: process.env.API_VERSION || 'v1',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/nexus_telephony',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    },
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'nexus-telephony-super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Rate Limiting
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Regional Configuration
  regions: {
    primary: process.env.PRIMARY_REGION || 'africa-west',
    secondary: process.env.SECONDARY_REGIONS?.split(',') || ['africa-east', 'africa-south'],
  },

  // WebRTC Configuration
  webrtc: {
    stunServer: process.env.WEBRTC_STUN_SERVER || 'stun:stun.l.google.com:19302',
    turnServer: process.env.WEBRTC_TURN_SERVER,
    turnUsername: process.env.WEBRTC_TURN_USERNAME,
    turnCredential: process.env.WEBRTC_TURN_CREDENTIAL,
  },

  // African Carriers Configuration
  carriers: {
    nigeria: {
      mtn: process.env.MTN_NG_API_KEY,
      airtel: process.env.AIRTEL_NG_API_KEY,
      glo: process.env.GLO_NG_API_KEY,
      etisalat: process.env.ETISALAT_NG_API_KEY,
    },
    kenya: {
      safaricom: process.env.SAFARICOM_KE_API_KEY,
      airtel: process.env.AIRTEL_KE_API_KEY,
    },
    ghana: {
      mtn: process.env.MTN_GH_API_KEY,
      airteltigo: process.env.AIRTELTIGO_GH_API_KEY,
      vodafone: process.env.VODAFONE_GH_API_KEY,
    },
    uganda: {
      mtn: process.env.MTN_UG_API_KEY,
      airtel: process.env.AIRTEL_UG_API_KEY,
    },
    rwanda: {
      mtn: process.env.MTN_RW_API_KEY,
      airtel: process.env.AIRTEL_RW_API_KEY,
    },
    liberia: {
      lonestar: process.env.LONESTAR_LR_API_KEY,
      orange: process.env.ORANGE_LR_API_KEY,
    },
  },

  // Payment Gateways
  payments: {
    bitsXpay: {
      apiKey: process.env.BITS_XPAY_API_KEY,
      secret: process.env.BITS_XPAY_SECRET,
    },
    flutterwave: {
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
    },
    paystack: {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      secretKey: process.env.PAYSTACK_SECRET_KEY,
    },
  },

  // AI/ML Services
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    googleCloud: {
      apiKey: process.env.GOOGLE_CLOUD_API_KEY,
    },
  },

  // Monitoring and Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  // Twilio Compatibility
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
};

export default config;