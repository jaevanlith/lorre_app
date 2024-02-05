import API from '../utils/API';

/**
 * Service for auth routes
 */
class AuthService {
  /**
   * Logs user in and on success inserts userId, accessToken and refreshToken in local storage
   * Returns 401 error if authorization fails
   * @param email
   * @param password
   * @returns {Promise<*>}
   */
  login(email, password) {
    return API.post('auth/login', {
      email,
      password,
    })
      .then((response) => {
        if (response.data.user) {
          localStorage.setItem('userId', response.data.user.id);
          localStorage.setItem('accessToken', response.data.tokens.access.token);
          localStorage.setItem('refreshToken', response.data.tokens.refresh.token);
          localStorage.setItem('role', response.data.user.role);
          return response.data;
        }
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  /**
   * Logs user out and removes userId, accessToken and refreshToken from local storage
   */
  logout() {
    return API.post('auth/logout', {
      refreshToken: localStorage.getItem('refreshToken'),
    }).then(() => {
      localStorage.clear();
      window.location = '/login';
    });
  }
}

export default new AuthService();
