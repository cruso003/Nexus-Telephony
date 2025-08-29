import request from 'supertest';
import app from '@/app';

describe('Health and API Info Endpoints', () => {
  test('GET /health should return healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('region', 'africa-west');
  });

  test('GET /api should return API information', async () => {
    const response = await request(app)
      .get('/api')
      .expect(200);

    expect(response.body).toHaveProperty('name', 'NexusAI Telephony API');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('version', 'v1');
    expect(response.body).toHaveProperty('status', 'operational');
    expect(response.body.regions).toHaveProperty('primary', 'africa-west');
  });
});

describe('Authentication Endpoints', () => {
  test('POST /api/v1/auth/register should create new user account', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'testpassword123',
      friendlyName: 'Test Account',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('account');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.account.friendlyName).toBe(userData.friendlyName);
  });

  test('POST /api/v1/auth/register should fail with invalid email', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'testpassword123',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/v1/auth/login should authenticate user', async () => {
    // First register a user
    const userData = {
      email: 'login-test@example.com',
      password: 'testpassword123',
    };

    await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    // Then login
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user.email).toBe(userData.email);
  });
});

describe('Call Management', () => {
  let authToken: string;
  let accountSid: string;

  beforeAll(async () => {
    // Register a test user
    const userData = {
      email: 'calls-test@example.com',
      password: 'testpassword123',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    authToken = response.body.data.token;
    accountSid = response.body.data.account.sid;
  });

  test('POST /api/v1/accounts/:accountSid/calls should create call', async () => {
    const callData = {
      To: '+234801234567',
      From: '+234700000000',
      Url: 'https://demo.nexusai.africa/voice-handler',
    };

    const response = await request(app)
      .post(`/api/v1/accounts/${accountSid}/calls`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(callData)
      .expect(201);

    expect(response.body).toHaveProperty('sid');
    expect(response.body.account_sid).toBe(accountSid);
    expect(response.body.to).toBe(callData.To);
    expect(response.body.from).toBe(callData.From);
    expect(response.body.status).toBe('queued');
    expect(response.body.to_country).toBe('NG');
    expect(response.body.from_country).toBe('NG');
    expect(response.body.rate_per_minute).toBe(0.001); // Local Nigeria rate
  });

  test('POST calls should use inter-African pricing', async () => {
    const callData = {
      To: '+254700123456', // Kenya
      From: '+234700000000', // Nigeria
    };

    const response = await request(app)
      .post(`/api/v1/accounts/${accountSid}/calls`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(callData)
      .expect(201);

    expect(response.body.to_country).toBe('KE');
    expect(response.body.from_country).toBe('NG');
    expect(response.body.rate_per_minute).toBe(0.002); // Inter-African rate
  });

  test('POST calls should require authentication', async () => {
    const callData = {
      To: '+234801234567',
      From: '+234700000000',
    };

    await request(app)
      .post(`/api/v1/accounts/${accountSid}/calls`)
      .send(callData)
      .expect(401);
  });

  test('Twilio compatibility endpoint should work', async () => {
    const callData = {
      To: '+233201234567', // Ghana
      From: '+234700000000', // Nigeria
    };

    const response = await request(app)
      .post(`/2010-04-01/Accounts/${accountSid}/Calls`)
      .auth(accountSid, authToken)
      .send(callData)
      .expect(201);

    expect(response.body.to_country).toBe('GH');
    expect(response.body.from_country).toBe('NG');
    expect(response.body.rate_per_minute).toBe(0.002); // Inter-African rate
  });
});