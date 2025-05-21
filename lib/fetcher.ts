import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://www.mindahun.pro.et/api/v1',
    // withCredentials: true
});

/** 
 * Check if code is running in browser environment
 * This avoids "localStorage is not defined" errors during SSR
 */
const isBrowser = typeof window !== 'undefined';

/** Interceptor for requests sent from the application: 
retrieve the Access Token from localStorage and 
add it to every API request made using the axios instance.
*/
axiosInstance.interceptors.request.use(
    function (config) {
        // Only try to get tokens from localStorage in browser environment
        if (isBrowser) {
            try {
                const tokens = localStorage.getItem("tokens");
                if (tokens) {
                    config.headers['Authorization'] = `Bearer ${JSON.parse(tokens).access}`;
                }
            } catch (error) {
                console.error("Error accessing tokens:", error);
            }
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// "tokens": {
//     "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NzQ4OTE4MywiaWF0IjoxNzQ3MDU3MTgzLCJqdGkiOiI1MTY5NTg5NWI0YzI0Yzg0ODViNzRkNTk4OWI4OWMzZSIsInVzZXJfaWQiOjN9.jivYaxMhHzyTxV5giEUfFJVdXBJC-pfEaZQEepWPTaA",
//         "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ3MTQzNTgzLCJpYXQiOjE3NDcwNTcxODMsImp0aSI6IjJiNDdkMjNhNDQ3MzQzMGI5OGNhNjU3Zjk5NTMzZGRkIiwidXNlcl9pZCI6M30.xzTBDtvX99qLI53Od5yLGRIgjplQRr9QotsWE7xr-NE"
// },


/** Interceptor for responses received by the application: 
check if the response indicates an expired access token, and 
if so, send a refresh token request to obtain a new access token and
retry the original request using the updated token.
Here the refresh token is stored as cookies.
*/
axiosInstance.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error) {
        // Only attempt token refresh in browser environment
        if (!isBrowser) {
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const tokens = localStorage.getItem('tokens');
                if (!tokens) {
                    console.log("No token in the axios instance");
                    return Promise.reject(error);
                }

                const response = await axios.post(`https://www.mindahun.pro.et/api/v1/auth/token/refresh/`, {
                    "refresh": JSON.parse(tokens).refresh
                });
                
                if (response && response.data) {
                    localStorage.setItem('tokens', JSON.stringify(response.data));
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;