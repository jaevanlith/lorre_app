import API from '../utils/API';
import MockAdapter from 'axios-mock-adapter';
import AuthService from './AuthService';

let mock;
beforeEach(() => {
  mock = new MockAdapter(API);
});

afterEach(() => {
  mock.restore();
  jest.clearAllMocks();
});

test('login should set tokens and userId in local storage', async () => {
  jest.spyOn(window.localStorage.__proto__, 'setItem');

  const data = {
    user: { id: 'testId', role: 'role' },
    tokens: { access: { token: 'testAccess' }, refresh: { token: 'testRefresh' } },
  };
  mock.onPost('auth/login', { email: 'admin@admin.nl', password: 'admin123' }).reply(200, data);

  await AuthService.login('admin@admin.nl', 'admin123').then((response) => {
    expect(response).toEqual(data);
    expect(localStorage.setItem).toHaveBeenCalledWith('userId', 'testId');
    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'testAccess');
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'testRefresh');
    expect(localStorage.setItem).toHaveBeenCalledWith('role', 'role');
  });
});

test('log out should send no data and remove tokens and userId from local storage', async () => {
  jest.spyOn(window.localStorage.__proto__, 'clear');
  jest.spyOn(window.localStorage.__proto__, 'getItem');

  mock.onPost('auth/logout').reply(204);

  await AuthService.logout().then(() => {
    expect(localStorage.getItem).toHaveBeenCalledWith('refreshToken');
    expect(localStorage.clear).toHaveBeenCalled();
  });
});

test('login fail should return 401 unauthorized error', async () => {
  jest.spyOn(window.localStorage.__proto__, 'setItem');
  window.localStorage.__proto__.getItem = jest.fn(() => null);

  mock.onPost('auth/login', { email: 'admin@admin.nl', password: 'admin123' }).reply(401);

  await expect(AuthService.login('admin@admin.nl', 'admin123')).rejects.toThrow('Request failed with status code 401');
});
