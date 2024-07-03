const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const server = require('../server');

describe('GET /status', () => {
  it('should return 200', (done) => {
    request(server)
      .get('/status')
      .expect(200, done);
  });
});

describe('GET /stats', () => {
  it('should return 200', (done) => {
    request(server)
      .get('/stats')
      .expect(200, done);
  });
});

describe('POST /users', () => {
  it('should return 201', (done) => {
    request(server)
      .post('/users')
      .send({ email: 'user@mail.com', password: 'password' })
      .expect(201, done);
  });
});

describe('GET /connect', () => {
  it('should return 401', (done) => {
    request(server)
      .get('/connect')
      .expect(401, done);
  });
});

describe('GET /disconnect', () => {
  it('should return 401', (done) => {
    request(server)
      .get('/disconnect')
      .expect(401, done);
  });
});

describe('GET /users/me', () => {
  it('should return 401', (done) => {
    request(server)
      .get('/users/me')
      .expect(401, done);
  });
});

describe('POST /files', () => {
  it('should return 401', (done) => {
    request(server)
      .post('/files')
      .expect(401, done);
  });
});

describe('GET /files/:id', () => {
  it('should return 401', (done) => {
    request(server)
      .get('/files/1')
      .expect(401, done);
  });
});

describe('GET /files', () => {
  it('should return 401', (done) => {
    request(server)
      .get('/files')
      .expect(401, done);
  });
});

describe('PUT /files/:id/publish', () => {
  it('should return 401', (done) => {
    request(server)
      .put('/files/1/publish')
      .expect(401, done);
  });
});

describe('PUT /files/:id/unpublish', () => {
  it('should return 401', (done) => {
    request(server)
      .put('/files/1/unpublish')
      .expect(401, done);
  });
});

describe('GET /files/:id/data', () => {
  it('should return 401', (done) => {
    request(server)
      .get('/files/1/data')
      .expect(401, done);
  });
});
