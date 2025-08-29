import { Router, Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@/types';
import logger from '@/utils/logger';

const router = Router();

// In-memory storage for demo (replace with database in production)
const accounts: any[] = [];

// Get account details
router.get('/:accountSid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountSid } = req.params;

    // Find account (in production, this would query the database)
    const account = accounts.find(a => a.sid === accountSid);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    res.json({
      sid: account.sid,
      friendly_name: account.friendlyName,
      status: account.status,
      type: account.type,
      date_created: account.dateCreated,
      date_updated: account.dateUpdated,
      auth_token: account.authToken,
      uri: `/2010-04-01/Accounts/${accountSid}`,
      subresource_uris: {
        calls: `/2010-04-01/Accounts/${accountSid}/Calls`,
        messages: `/2010-04-01/Accounts/${accountSid}/Messages`,
        recordings: `/2010-04-01/Accounts/${accountSid}/Recordings`,
        transcriptions: `/2010-04-01/Accounts/${accountSid}/Transcriptions`,
        notifications: `/2010-04-01/Accounts/${accountSid}/Notifications`,
        applications: `/2010-04-01/Accounts/${accountSid}/Applications`,
        phone_numbers: `/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers`,
        outgoing_caller_ids: `/2010-04-01/Accounts/${accountSid}/OutgoingCallerIds`,
        conferences: `/2010-04-01/Accounts/${accountSid}/Conferences`,
        queues: `/2010-04-01/Accounts/${accountSid}/Queues`,
        usage: `/2010-04-01/Accounts/${accountSid}/Usage`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update account details
router.post('/:accountSid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountSid } = req.params;
    const { FriendlyName } = req.body;

    // Find account
    const accountIndex = accounts.findIndex(a => a.sid === accountSid);
    if (accountIndex === -1) {
      throw new NotFoundError('Account not found');
    }

    // Update account
    if (FriendlyName) {
      accounts[accountIndex].friendlyName = FriendlyName;
      accounts[accountIndex].dateUpdated = new Date();
    }

    const account = accounts[accountIndex];

    logger.info('Account updated', { accountSid, friendlyName: FriendlyName });

    res.json({
      sid: account.sid,
      friendly_name: account.friendlyName,
      status: account.status,
      type: account.type,
      date_created: account.dateCreated,
      date_updated: account.dateUpdated,
      auth_token: account.authToken,
      uri: `/2010-04-01/Accounts/${accountSid}`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;