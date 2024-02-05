import API from './API';
import MockAdapter from 'axios-mock-adapter';

let mock;
beforeEach(() => {
  mock = new MockAdapter(API);
});

afterEach(() => {
  mock.restore();
  jest.clearAllMocks();
});

test('Request interceptor should add bearer auth token to auth header', () => {
  window.localStorage.__proto__.getItem = jest.fn(() => 'testToken');

  const result = API.interceptors.request.handlers[0].fulfilled({ headers: {} });

  expect(localStorage.getItem).toHaveBeenNthCalledWith(1, 'accessToken');
  expect(result.headers).toHaveProperty('Authorization');
  expect(result.headers.Authorization).toEqual('Bearer testToken');
});

test('Response interceptor should return response if no errors', () => {
  const testData = { data: 'test' };
  expect(API.interceptors.response.handlers[0].fulfilled(testData)).toBe(testData);
});

test('Response interceptor should try to refresh tokens when rejected', () => {
  window.localStorage.__proto__.getItem = jest.fn(() => 'testToken');

  mock.onPost('auth/refresh-tokens', { refreshToken: 'testToken' }).reply(200, {
    access: {
      token: 'testAccess',
    },
    refresh: {
      token: 'testRefresh',
    },
  });
  mock.onGet('auth/protected').reply(200);

  API.interceptors.response.handlers[0].rejected({
    response: {
      status: 401,
    },
    config: {
      url: 'auth/protected',
    },
  });

  expect(localStorage.getItem).toHaveBeenNthCalledWith(1, 'refreshToken');
});
