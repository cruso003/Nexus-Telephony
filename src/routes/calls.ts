import { Router, Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { generateCallSid, formatPhoneNumber, validatePhoneNumber, getCountryFromPhoneNumber, calculateCallPrice } from '@/utils/helpers';
import { ValidationError, NotFoundError, CallStatus, CallDirection } from '@/types';
import logger from '@/utils/logger';

const router = Router({ mergeParams: true });

// Validation schemas
const createCallSchema = Joi.object({
  To: Joi.string().required(),
  From: Joi.string().required(),
  Url: Joi.string().uri().optional(),
  Method: Joi.string().valid('GET', 'POST').default('POST'),
  Timeout: Joi.number().min(1).max(600).default(60),
  Record: Joi.boolean().default(false),
  MachineDetection: Joi.boolean().default(false),
});

// In-memory storage for demo (replace with database in production)
const calls: any[] = [];

// Create a new call
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountSid } = req.params;
    const { error, value } = createCallSchema.validate(req.body);
    
    if (error) {
      throw new ValidationError('Validation failed', error.details);
    }

    const { To, From, Url, Method, Timeout, Record, MachineDetection } = value;

    // Validate phone numbers
    if (!validatePhoneNumber(To)) {
      throw new ValidationError('Invalid "To" phone number');
    }
    if (!validatePhoneNumber(From)) {
      throw new ValidationError('Invalid "From" phone number');
    }

    // Format phone numbers
    const toFormatted = formatPhoneNumber(To);
    const fromFormatted = formatPhoneNumber(From);

    // Get country information
    const toCountry = getCountryFromPhoneNumber(toFormatted);
    const fromCountry = getCountryFromPhoneNumber(fromFormatted);

    // Generate call SID
    const callSid = generateCallSid();

    // Determine pricing based on countries
    let ratePerMinute = 0.003; // Default international rate
    if (toCountry && fromCountry) {
      if (toCountry === fromCountry) {
        ratePerMinute = 0.001; // Local rate
      } else if (isAfricanCountry(toCountry) && isAfricanCountry(fromCountry)) {
        ratePerMinute = 0.002; // Inter-African rate
      }
    }

    // Create call record
    const call = {
      sid: callSid,
      account_sid: accountSid,
      to: toFormatted,
      from: fromFormatted,
      status: CallStatus.QUEUED,
      start_time: null,
      end_time: null,
      duration: null,
      price: null,
      price_unit: 'USD',
      direction: CallDirection.OUTBOUND,
      answered_by: null,
      forwarded_from: null,
      caller_name: null,
      uri: `/2010-04-01/Accounts/${accountSid}/Calls/${callSid}`,
      date_created: new Date(),
      date_updated: new Date(),
      // Additional fields for African markets
      to_country: toCountry,
      from_country: fromCountry,
      rate_per_minute: ratePerMinute,
      webhook_url: Url,
      webhook_method: Method,
      timeout: Timeout,
      record: Record,
      machine_detection: MachineDetection,
      subresource_uris: {
        recordings: `/2010-04-01/Accounts/${accountSid}/Calls/${callSid}/Recordings`,
        notifications: `/2010-04-01/Accounts/${accountSid}/Calls/${callSid}/Notifications`,
      },
    };

    calls.push(call);

    // Simulate call processing (in production, this would trigger actual call)
    setTimeout(() => {
      const callIndex = calls.findIndex(c => c.sid === callSid);
      if (callIndex !== -1) {
        calls[callIndex].status = CallStatus.RINGING;
        calls[callIndex].start_time = new Date();
        calls[callIndex].date_updated = new Date();
        
        // Simulate call progression
        setTimeout(() => {
          if (calls[callIndex] && calls[callIndex].status === CallStatus.RINGING) {
            calls[callIndex].status = CallStatus.IN_PROGRESS;
            calls[callIndex].date_updated = new Date();
            
            // Simulate call completion
            setTimeout(() => {
              if (calls[callIndex] && calls[callIndex].status === CallStatus.IN_PROGRESS) {
                const duration = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
                calls[callIndex].status = CallStatus.COMPLETED;
                calls[callIndex].end_time = new Date();
                calls[callIndex].duration = duration;
                calls[callIndex].price = calculateCallPrice(duration, ratePerMinute, toCountry || 'INTL').toFixed(4);
                calls[callIndex].date_updated = new Date();
              }
            }, 5000); // Complete after 5 seconds
          }
        }, 2000); // Answer after 2 seconds
      }
    }, 1000); // Start ringing after 1 second

    logger.info('Call created', { 
      callSid, 
      accountSid, 
      to: toFormatted, 
      from: fromFormatted,
      toCountry,
      fromCountry,
      ratePerMinute 
    });

    res.status(201).json(call);
  } catch (error) {
    next(error);
  }
});

// Get all calls for an account
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountSid } = req.params;
    const { Page = '0', PageSize = '50' } = req.query;

    const page = parseInt(Page as string, 10);
    const pageSize = Math.min(parseInt(PageSize as string, 10), 1000);
    const offset = page * pageSize;

    // Filter calls for this account
    const accountCalls = calls.filter(call => call.account_sid === accountSid);
    const paginatedCalls = accountCalls.slice(offset, offset + pageSize);

    res.json({
      calls: paginatedCalls,
      page: page,
      page_size: pageSize,
      num_pages: Math.ceil(accountCalls.length / pageSize),
      total: accountCalls.length,
      start: offset,
      end: Math.min(offset + pageSize - 1, accountCalls.length - 1),
      uri: `/2010-04-01/Accounts/${accountSid}/Calls`,
      first_page_uri: `/2010-04-01/Accounts/${accountSid}/Calls?Page=0&PageSize=${pageSize}`,
      previous_page_uri: page > 0 ? `/2010-04-01/Accounts/${accountSid}/Calls?Page=${page - 1}&PageSize=${pageSize}` : null,
      next_page_uri: (offset + pageSize) < accountCalls.length ? `/2010-04-01/Accounts/${accountSid}/Calls?Page=${page + 1}&PageSize=${pageSize}` : null,
    });
  } catch (error) {
    next(error);
  }
});

// Get specific call details
router.get('/:callSid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountSid, callSid } = req.params;

    const call = calls.find(c => c.sid === callSid && c.account_sid === accountSid);
    if (!call) {
      throw new NotFoundError('Call not found');
    }

    res.json(call);
  } catch (error) {
    next(error);
  }
});

// Update call (e.g., hangup)
router.post('/:callSid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountSid, callSid } = req.params;
    const { Status } = req.body;

    const callIndex = calls.findIndex(c => c.sid === callSid && c.account_sid === accountSid);
    if (callIndex === -1) {
      throw new NotFoundError('Call not found');
    }

    const call = calls[callIndex];

    // Handle status updates
    if (Status === 'completed' && call.status === CallStatus.IN_PROGRESS) {
      const now = new Date();
      const duration = call.start_time ? Math.floor((now.getTime() - new Date(call.start_time).getTime()) / 1000) : 0;
      
      calls[callIndex].status = CallStatus.COMPLETED;
      calls[callIndex].end_time = now;
      calls[callIndex].duration = duration;
      calls[callIndex].price = calculateCallPrice(duration, call.rate_per_minute, call.to_country || 'INTL').toFixed(4);
      calls[callIndex].date_updated = now;

      logger.info('Call completed', { callSid, accountSid, duration });
    }

    res.json(calls[callIndex]);
  } catch (error) {
    next(error);
  }
});

// Helper function to check if a country is African
function isAfricanCountry(countryCode: string): boolean {
  const africanCountries = [
    'NG', 'KE', 'GH', 'UG', 'RW', 'LR', 'ZA', 'ET', 'TZ', 'GM', 'SN', 'CI', 'BF', 'NE', 'TG', 'BJ',
    'MU', 'SL', 'TD', 'CF', 'CM', 'CV', 'ST', 'GQ', 'GA', 'CG', 'CD', 'AO', 'GW', 'IO', 'AC', 'SC',
    'SD', 'SO', 'DJ', 'BI', 'MZ', 'ZM', 'MG', 'RE', 'ZW', 'NA', 'MW', 'LS', 'BW', 'SZ', 'KM', 'SH',
    'ER', 'AW', 'FO', 'GL',
  ];
  return africanCountries.includes(countryCode);
}

export default router;