import axios from 'axios';

// axios instance → tüm isteklerde base URL otomatik eklenir
const api = axios.create({
    baseURL: 'http//localhost:5071/api',
});

// Her istekte token varsa Authorization header'ına ekle
// interceptor → her istek gönderilmeden önce çalışır
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
