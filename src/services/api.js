import axios from 'axios';

// axios instance → tüm isteklerde base URL otomatik eklenir
const api = axios.create({
    baseURL: 'http://localhost:5071/api',
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

// 🔥 YENİ: Response interceptor - Hataları yakala
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Backend'den gelen hata
            const { status, data } = error.response;
            
            if (status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
            
            // Hata mesajını göster
            if (data?.message) {
                alert(data.message);
            }
        } else if (error.request) {
            // İstek gönderildi ama cevap gelmedi
            alert("Sunucuya bağlanılamadı. Lütfen backend'in çalıştığından emin olun.");
        } else {
            // Başka hata
            alert('Bir hata oluştu: ' + error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;
