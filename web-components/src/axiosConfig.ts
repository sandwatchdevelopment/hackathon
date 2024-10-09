import axios from 'axios';
import localforage from 'localforage';

const api = axios.create({
  baseURL: 'https://3v4i2pavob.execute-api.us-west-2.amazonaws.com/v1',
});

const isTokenExpired = (token: string) => {
  const tokenParts = token.split('.');
  if (tokenParts.length < 2) {
    throw new Error('Invalid token');
  }
  const payload = JSON.parse(atob(tokenParts[1] || ''));
  return payload.exp * 1000 < Date.now();
};

api.interceptors.request.use(
  async config => {
    let accessToken = await localforage.getItem<string>('accessToken');
    if (accessToken && isTokenExpired(accessToken)) {
      try {
        const refreshToken = await localforage.getItem<string>('refreshToken');
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh_token`, { refreshToken });
        accessToken = data.accessToken;
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        // Handle refresh token failure (e.g., redirect to login)
      }
    }
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => {    
    if (response.config.url?.endsWith('/auth/access_token') || response.config.url?.endsWith('/auth/refresh_token')) {
      const responseBody = JSON.parse(response.data.body);
      const accessToken = responseBody.token;
      const refreshToken = responseBody.refresh_token;
      if (accessToken) {
        localforage.setItem('accessToken', accessToken);
        
      }
      if (refreshToken) {
        localforage.setItem('refreshToken', refreshToken);
      }
    }
    return response;
  },
  error => Promise.reject(error)
);

export default api;