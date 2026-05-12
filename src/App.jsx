import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";


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
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }>        </Route>
        <Route path="/transactions" element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }></Route>
      </Routes>
    </BrowserRouter>
  )
}