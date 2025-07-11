const TOKEN_KEY = "token";
const USER_KEY = "user";

const authService = {
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("registrationStep");
    localStorage.removeItem("awaitingYouTubeAuth");
    localStorage.removeItem("youtubeRedirectUrl");
  },

  isAuthenticated: () => {
    const token = authService.getToken();
    return !!token;
  },
};

export default authService;
