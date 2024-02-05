import axios from 'axios';

// Import this to make http requests, see example in services/AuthService.js
const API = axios.create({
  baseURL: 'http://localhost:5000/api/', // base url of the server, see server/routes/index.js for specific paths
});

// Request interceptor add authorization header + access token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor, returns response if authorized
 * Will refresh accessToken if expired, or reject request if not authorized
 */
API.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    const originalRequest = error.config;

    if (error.response.status === 401 && originalRequest.url === 'auth/refresh-tokens') {
      // can't refresh, need to relog so clear local storage and send to login screen
      localStorage.clear();
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        return API.post('auth/refresh-tokens', {
          refreshToken: refreshToken,
        }).then((res) => {
          if (res.status === 200) {
            localStorage.setItem('accessToken', res.data.access.token);
            localStorage.setItem('refreshToken', res.data.refresh.token);
            API.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
            return API(originalRequest);
          }
        });
      }
      // can't find refresh token, so need to relog
      localStorage.clear();
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default API;
