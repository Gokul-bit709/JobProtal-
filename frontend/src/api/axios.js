// import axios from "axios";

// const api = axios.create({
//     baseURL: "http://127.0.0.1:8000/api/",
// });

// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("access");
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// export default api;
// import axios from "axios";

// const api = axios.create({
//   // baseURL: "http://54.183.89.14/api/",
//   baseURL: "http://127.0.0.1:8000/api/",

// });
// // const baseURL =
// //   window.location.hostname === "localhost"
// //     ? "http://127.0.0.1:8000/api/"
// //     : "http://54.183.89.14/api/";

// // const api = axios.create({
// //   baseURL: baseURL,
// // });
// // console.log("API URL:", baseURL);


// // REQUEST
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });


// // RESPONSE (refresh)
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access");

//   // 🟢 Public APIs (login/signup allow cheyyali)
//   const publicUrls = ["/login/", "/signup/", "/token/refresh/"];

//   const isPublic = publicUrls.some((url) =>
//     config.url.includes(url)
//   );

//   // ❌ Token lekapothe private requests block
//   if (!token && !isPublic) {
//     return Promise.reject(new Error("No token, request blocked"));
//   }

//   // ✅ Token unte attach cheyyi
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;

// import axios from "axios";

// const baseURL =
//   window.location.hostname === "localhost"
//     ? "http://127.0.0.1:8000/api/"
//     : "http://54.183.89.14/api/";

// const api = axios.create({
//   baseURL: baseURL,
// });

// // ✅ REQUEST INTERCEPTOR (clean)
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");

//     // Token unte attach cheyyi
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;

import axios from "axios";

const baseURL = "http://127.0.0.1:8000/api/";
// const baseURL = "http://54.183.89.14/api/";


console.log("API Base URL:", baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// REQUEST interceptor - Add access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    // Don't add token for public endpoints if needed
    const publicEndpoints = ["/login/", "/register/", "/send-email-otp/", "/verify-email-otp/", "token/refresh/", "token/"]; const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 Request to ${config.url}: Token added`);
    } else if (isPublicEndpoint) {
      console.log(`🌐 Public request to ${config.url}: No token needed`);
    } else {
      console.log(`⚠️ Request to ${config.url}: No token available`);
    }

    // Log request details for debugging
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data && !(config.data instanceof FormData)) {
      console.log("Request data:", config.data);
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// RESPONSE interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error details
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error:`, error.response?.status);
    console.error("Error details:", error.response?.data);

    // Check if it's a 401 Unauthorized error
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      // Don't try to refresh if no refresh token or if it's already a refresh request
      if (!refreshToken || originalRequest.url.includes("/token/refresh/")) {
        console.log("No refresh token or refresh request failed - redirecting to login");
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        console.log("🔄 Attempting to refresh access token...");

        const response = await axios.post(`${baseURL}token/refresh/`, {
          refresh: refreshToken
        });

        const newAccessToken = response.data.access;

        // Store new access token
        localStorage.setItem("access", newAccessToken);
        console.log(" Token refreshed successfully");

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request
        return api(originalRequest);

      } catch (refreshError) {
        console.error(" Token refresh failed:", refreshError);

        // Clear all stored data
        localStorage.clear();

        // Redirect to login page
        window.location.href = "/";

        return Promise.reject(refreshError);
      }
    }

    // Handle other error statuses
    if (error.response?.status === 403) {
      console.error("Forbidden - User doesn't have permission");
      // You might want to show a notification here
    } else if (error.response?.status === 404) {
      console.error("Not found - Endpoint doesn't exist");
    } else if (error.response?.status === 500) {
      console.error("Server error - Please try again later");
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout - Please check your connection");
    } else if (!error.response) {
      console.error("Network error - Please check your connection");
    }

    return Promise.reject(error);
  }
);

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("access");
  return !!token;
};

// Helper function to get user type
export const getUserType = () => {
  return localStorage.getItem("user_type");
};

// Helper function to logout
export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};

export default api;
