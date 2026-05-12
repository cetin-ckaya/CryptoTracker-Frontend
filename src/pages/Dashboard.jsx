import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  // Portföy özeti — toplam değer, kar/zarar vs.
  const [summary, setSummary] = useState(null);

  // Yüklenme durumu — veri gelene kadar spinner göster
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Sayfa açılınca portföy özetini çek
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/portfolio/summary');
        setSummary(response.data);
      } catch (err) {
        // Token geçersizse login'e yönlendir
        localStorage.removeItem('token');
        navigate('/');
      } finally {
        // Veri geldi ya da hata oluştu — yükleniyor durumunu kapat
        setLoading(false);
      }
    };

    fetchSummary();
  }, []); // [] → sadece sayfa ilk açıldığında çalış

  const handleLogout = () => {
    // Token'ı sil ve login'e yönlendir
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) return <div style={styles.loading}>Yükleniyor...</div>;

  return (
    <div style={styles.container}>

      {/* ÜST BAR */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>Crypto<span style={styles.accent}>Tracker</span></h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
          <span style={{color: '#6366f1', fontWeight: '600', fontSize: '14px'}}>Dashboard</span>
          <span style={{color: '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '14px'}} onClick={() => navigate('/transactions')}>İşlemler</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </div>

      <div style={styles.content}>

        {/* STAT KARTLARI */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>TOPLAM DEĞER</p>
            <p style={styles.statValue}>${summary?.totalValue?.toFixed(2) ?? '0.00'}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>TOPLAM YATIRIM</p>
            <p style={styles.statValue}>${summary?.totalInvested?.toFixed(2) ?? '0.00'}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>KAR / ZARAR</p>
            <p style={{
              ...styles.statValue,
              color: summary?.totalProfitLoss >= 0 ? '#00e5b0' : '#ff6b6b'
            }}>
              {summary?.totalProfitLoss >= 0 ? '+' : ''}
              ${summary?.totalProfitLoss?.toFixed(2) ?? '0.00'}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>KAR / ZARAR %</p>
            <p style={{
              ...styles.statValue,
              color: summary?.totalProfitLossPercentage >= 0 ? '#00e5b0' : '#ff6b6b'
            }}>
              {summary?.totalProfitLossPercentage >= 0 ? '+' : ''}
              {summary?.totalProfitLossPercentage?.toFixed(2) ?? '0.00'}%
            </p>
          </div>
        </div>

        {/* PORTFÖY TABLOSU */}
        <div style={styles.tableCard}>
          <h2 style={styles.tableTitle}>Portföy Dağılımı</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Coin</th>
                <th style={styles.th}>Anlık Fiyat</th> {/* 🔥 YENİ */}
                <th style={styles.th}>Miktar</th>
                <th style={styles.th}>Ort. Maliyet</th>
                <th style={styles.th}>Güncel Değer</th>
                <th style={styles.th}>K/Z</th>
                <th style={styles.th}>K/Z %</th>
              </tr>
            </thead>
            <tbody>
              {summary?.coins?.length === 0 && (
                <tr>
                  <td colSpan={6} style={{...styles.td, textAlign: 'center', color: '#94a3b8'}}>
                    Henüz işlem yok. İşlem ekleyerek başla!
                  </td>
                </tr>
              )}
              {summary?.coins?.map((coin) => (
                <tr key={coin.coinSymbol} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.coinBadge}>{coin.coinSymbol}</span>
                  </td>
                   <td style={styles.td}>
                    {/* 🔥 YENİ: Anlık Fiyat */}
                    <span style={{ color: '#6366f1', fontWeight: '600' }}>
                        ${coin.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  <td style={styles.td}>{coin.totalAmount}</td>
                  <td style={styles.td}>${coin.averageBuyPrice?.toFixed(2)}</td>
                  <td style={styles.td}>${coin.currentValue?.toFixed(2)}</td>
                  <td style={{
                    ...styles.td,
                    color: coin.profitLoss >= 0 ? '#00e5b0' : '#ff6b6b'
                  }}>
                    {coin.profitLoss >= 0 ? '+' : ''}${coin.profitLoss?.toFixed(2)}
                  </td>
                  <td style={{
                    ...styles.td,
                    color: coin.profitLossPercentage >= 0 ? '#00e5b0' : '#ff6b6b'
                  }}>
                    {coin.profitLossPercentage >= 0 ? '+' : ''}
                    {coin.profitLossPercentage?.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', background: '#1e293b', borderBottom: '1px solid #334155' },
  logo: { fontSize: '22px', fontWeight: '800', color: '#f1f5f9' },
  accent: { color: '#6366f1' },
  logoutBtn: { padding: '8px 16px', borderRadius: '8px', background: '#334155', color: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: '600' },
  content: { padding: '32px 40px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' },
  statLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '1px', marginBottom: '8px' },
  statValue: { fontSize: '24px', fontWeight: '800', color: '#f1f5f9' },
  tableCard: { background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' },
  tableTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '1px', borderBottom: '1px solid #334155' },
  td: { padding: '14px 12px', fontSize: '14px', borderBottom: '1px solid #1e293b' },
  tr: { transition: 'background 0.2s' },
  coinBadge: { background: '#334155', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '13px' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f1f5f9', fontSize: '18px' },
};