import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Email veya şifre hatalı');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Crypto<span style={styles.accent}>Tracker</span></h1>
        <p style={styles.subtitle}>Portföyünü takip et</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit">Giriş Yap</button>
        </form>
        <p style={styles.register}>
          Hesabın yok mu?{' '}
          <span style={styles.link} onClick={() => navigate('/register')}>Kayıt Ol</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' },
  card: { background: '#1e293b', padding: '40px', borderRadius: '12px', width: '360px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
  title: { color: '#f1f5f9', fontSize: '28px', fontWeight: '800', marginBottom: '4px', textAlign: 'center' },
  accent: { color: '#6366f1' },
  subtitle: { color: '#94a3b8', textAlign: 'center', marginBottom: '32px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  button: { padding: '12px', borderRadius: '8px', background: '#6366f1', color: 'white', border: 'none', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '8px' },
  error: { color: '#f87171', fontSize: '13px' },
  register: { color: '#94a3b8', textAlign: 'center', marginTop: '20px', fontSize: '14px' },
  link: { color: '#6366f1', cursor: 'pointer', fontWeight: '600' },
};