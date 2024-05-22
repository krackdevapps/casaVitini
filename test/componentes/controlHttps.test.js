// controlHTTPS.test.js
import request from 'supertest';
import app from '../../casaVitini.mjs';

describe('controlHTTPS middleware', () => {
  it('should redirect to casavitini.com if host is lripoll.ddns.net', async () => {
    const response = await request(app)
      .get('/')
      .set('host', 'lripoll.ddns.net');
    
    expect(response.statusCode).toBe(301);
  });

  it('should redirect to HTTPS if request is not secure and host is not localhost', async () => {
    const response = await request(app)
      .get('/')
      .set('host', 'example.com');
    
    expect(response.statusCode).toBe(301);
  });

  it('should call next if request is secure', async () => {
    const response = await request(app)
      .get('/')
      .set('host', 'example.com')
      .set('x-forwarded-proto', 'https');  // Simulate a secure request
    
    expect(response.statusCode).toBe(200);
  });

  it('should call next if host is localhost', async () => {
    const response = await request(app)
      .get('/test')
      .set('host', 'localhost');
    
    expect(response.statusCode).toBe(200);
  });
});
