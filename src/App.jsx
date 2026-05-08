import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';


// Token var mı kontrol et — yoksa login'e yönlendir
const PrivateRoute = ({children}) => {
  const token = localStorage.getItem('token');
  return token ? children : < Navigate to='/' />
};
export default function App() {
  return (
    <BrowserRouter>
    <Routes>
      {/* Herkese açık sayfalar */}
      <Route path="/" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>

      {/* Korumalı sayfalar — token olmadan erişilemez */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <div style={{color:'white', padding:'40px'}}>Dashboard yakında geliyor...</div>
        </PrivateRoute>
      }></Route>
    </Routes>
    </BrowserRouter>
  )
}