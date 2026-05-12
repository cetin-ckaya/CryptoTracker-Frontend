import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Transactions() {
    //İşlem listesi
    const [transactions, setTransactions] = useState([]);

    //Yeni işlem formu verileri
    const [coinSymbol, setCoinSymbol] = useState('');
    const [type, setType] = useState('buy');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');

    // Arama önerileri için state'ler
    const [coinList, setCoinList] = useState([]); 
    const [filteredCoins, setFilteredCoins] = useState([]); 
    const [showSuggestions, setShowSuggestions] = useState(false); 

    //Modal açık mı kapalı mı
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    //Sayfa açılınca işlemleri çek
    useEffect(() => {
        fetchTransactions();
        fetchCoinList(); // Coin listesini çek
    },[]);

    // CoinGecko'dan temel coin listesini çek
    // CoinGecko'dan temel coin listesini çek
const fetchCoinList = async () => {
    try {
        const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false'
        );
        
        const data = await response.json();
        
        // API'den gelen coinleri formatla
        const apiCoins = data.map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            id: coin.id
        }));
        
        // 🔥 Manuel coinler (API'de ilk 250'de olmayanlar)
        const manualCoins = [
            { symbol: 'METIS', name: 'Metis', id: 'metis-token' },
            { symbol: 'EIGEN', name: 'EigenLayer', id: 'eigenlayer' },
            { symbol: 'PEPE', name: 'Pepe', id: 'pepe' },
            { symbol: 'SHIB', name: 'Shiba Inu', id: 'shiba-inu' },
            { symbol: 'ARB', name: 'Arbitrum', id: 'arbitrum' },
            { symbol: 'OP', name: 'Optimism', id: 'optimism' },
            { symbol: 'FTM', name: 'Fantom', id: 'fantom' },
            { symbol: 'NEAR', name: 'Near Protocol', id: 'near' },
            { symbol: 'ALGO', name: 'Algorand', id: 'algorand' },
            { symbol: 'VET', name: 'VeChain', id: 'vechain' },
            { symbol: 'ICP', name: 'Internet Computer', id: 'internet-computer' },
            { symbol: 'FIL', name: 'Filecoin', id: 'filecoin' },
            { symbol: 'HBAR', name: 'Hedera', id: 'hedera-hashgraph' },
            { symbol: 'AI', name: 'Sleepless AI', id: 'sleepless-ai' },
            { symbol: 'SAND', name: 'The Sandbox', id: 'the-sandbox' },
            { symbol: 'MANA', name: 'Decentraland', id: 'decentraland' },
            { symbol: 'AXS', name: 'Axie Infinity', id: 'axie-infinity' },
            { symbol: 'THETA', name: 'Theta Network', id: 'theta-token' },
            { symbol: 'XTZ', name: 'Tezos', id: 'tezos' },
            { symbol: 'EOS', name: 'EOS', id: 'eos' }
        ];
        
        // İkisini birleştir (aynı sembol varsa API öncelikli)
        const combinedMap = new Map();
        
        // Önce manuel coinleri ekle
        manualCoins.forEach(coin => {
            combinedMap.set(coin.symbol, coin);
        });
        
        // Sonra API coinlerini ekle (varsa üzerine yazar)
        apiCoins.forEach(coin => {
            combinedMap.set(coin.symbol, coin);
        });
        
        const formattedList = Array.from(combinedMap.values());
        
        setCoinList(formattedList);
        console.log('✅ Toplam coin:', formattedList.length, '(API:', apiCoins.length, '+ Manuel:', manualCoins.length, ')');
        
    } catch (err) {
        console.error('❌ Coin listesi çekilemedi:', err.message);
    }
};

    const fetchTransactions = async () => {
        try{
            const response = await api.get('/transaction?page=1&pageSize=50');
            setTransactions(response.data.data);
        }catch(err){
            localStorage.removeItem('token');
            navigate('/');
        }finally{
            setLoading(false);
        }
    };

    // Kullanıcı arama inputuna yazdıkça çalışır
    const handleSymbolChange = (e) => {
        const value = e.target.value;
        setCoinSymbol(value.toUpperCase());
        
        if (value.trim().length > 0) {
            const filtered = coinList.filter(coin => 
                coin.symbol.includes(value.toUpperCase()) || 
                coin.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCoins(filtered.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setFilteredCoins([]);
            setShowSuggestions(false);
        }
    };

    // Önerilerden bir coine tıklandığında
    const handleSelectCoin = (coin) => {
        setCoinSymbol(coin.symbol);
        // Fiyatı otomatik DOLDURMUYORUZ. Boş bırakıyoruz.
        setShowSuggestions(false);
    };

    //Yeni işlem ekle
    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        try{
            await api.post('/transaction', {
                coinSymbol : coinSymbol.toUpperCase(),
                type,
                amount: parseFloat(amount),
                price: parseFloat(price)
            });

            //Formu sıfırla ve modalı kapat
            setCoinSymbol('');
            setType('buy');
            setAmount('');
            setPrice('');
            setShowModal(false);

            //Listeyi yenile
            fetchTransactions();
        }catch(err) {
            setError('İşlem eklenemedi');
        }
    };

    //İşlemi sil
    const handleDelete = async (id) => {
        if(!window.confirm('bu işlemi silmek istediğinizden emin misiniz?')) return;
        try{
            await api.delete(`/transaction/${id}`);
            //Silinen işlemi listeden çıkar
            setTransactions(transactions.filter(t => t.id !== id));
        }catch(err){
            alert('İşlem silinemedi');
        }
    };

    if(loading) return <div style={styles.loading}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>
             {/* ÜST BAR */}
             <div style={styles.navbar}>
                <h1 style={styles.logo}>Crypto <span style={styles.accent}>Tracker</span></h1>
                <div style={styles.navLinks}>
                    <span style={styles.navLink} onClick={() => navigate('/dashboard')}>Dashboard</span>
                    <span style={{...styles.navLink, color: '#6366f1'}}>İşlemler</span>
                    <button style={styles.logoutBtn} onClick={() => {localStorage.removeItem('token'); navigate('/')}}>Çıkış</button>
                </div>
             </div>

             <div style={styles.content}>
                <div style={styles.header}>
                    <h2 style={styles.title}>İşlem Geçmişi</h2>
                    <button style={styles.addBtn} onClick={() => setShowModal(true)}>+ Yeni İşlem</button>
                </div>

                {/* İŞLEM TABLOSU */}
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Coin</th>
                                <th style={styles.th}>Tip</th>
                                <th style={styles.th}>Miktar</th>
                                <th style={styles.th}>Alış Fiyatı</th>
                                <th style={styles.th}>Toplam Tutar</th>
                                <th style={styles.th}>Tarih</th>
                                <th style={styles.th}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{...styles.td, textAlign:'center', color: '#94a3b8'}}>
                                        Henüz işlem yok. Yeni işlem ekle!
                                    </td>
                                </tr>
                            )}
                            {transactions.map((t) => (
                                <tr key={t.id}>
                                    <td style={styles.td}><span style={styles.coinBadge}>{t.coinSymbol}</span></td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.typeBadge,
                                            background: t.type === 'buy' ? 'rgba(0,229,176,0.15)' : 'rgba(255,107,107,0.15)',
                                            color: t.type === 'buy' ? '#00e5b0' : '#ff6b6b'
                                        }}>
                                            {t.type === 'buy' ? 'AL' : 'SAT'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{t.amount}</td>
                                    <td style={styles.td}>${t.price?.toLocaleString()}</td>
                                    <td style={styles.td}>${(t.amount * t.price).toLocaleString()}</td>
                                    <td style={styles.td}>{new Date(t.date).toLocaleDateString('tr-TR')}</td>
                                    <td style={styles.td}>
                                        <button style={styles.deleteBtn} onClick={() => handleDelete(t.id)}>Sil</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>         
             </div>

             {/* MODAL — YENİ İŞLEM FORMU */}
             {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>Yeni İşlem Ekle</h3>
                        <form onSubmit={handleAdd} style={styles.form}>
                            
                            {/* ARAMA KUTUSU VE ÖNERİLER */}
                            <div style={{ position: 'relative' }}>
                                <input 
                                style={{...styles.input, width: '100%', boxSizing: 'border-box'}}
                                type='text'
                                placeholder="Coin ara (isim veya sembol)" 
                                value={coinSymbol}
                                onChange={handleSymbolChange}
                                onFocus={() => coinSymbol && filteredCoins.length > 0 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
                                required
                                autoComplete="off"
                                />
                                
                                {showSuggestions && filteredCoins.length > 0 && (
                                    <div style={styles.suggestionsContainer}>
                                        {filteredCoins.map((coin) => (
                                            <div 
                                                key={coin.id} 
                                                style={styles.suggestionItem}
                                                onClick={() => handleSelectCoin(coin)}
                                            >
                                                <span style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{coin.symbol}</span>
                                                <span style={{ color: '#94a3b8', fontSize: '12px' }}> - {coin.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <select 
                            style={styles.input}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            >
                                <option value="buy">Al</option>
                                <option value="sell">Sat</option>
                            </select>
                            
                            <input
                            style={styles.input}
                            type='number'
                            placeholder='Miktar (Örn: 0.5)'
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                             />
                             
                             <input 
                             style={styles.input}
                             type='number'
                             placeholder='İşlemi Yaptığınız Fiyat ($)'
                             step='any'
                             value={price}
                             onChange={(e) => setPrice(e.target.value)}
                             required
                              />

                              {error && <p style={styles.error}>{error}</p>}
                              
                              <div style={styles.modalBtns}>
                                <button type='button' style={styles.cancelBtn} onClick={() => setShowModal(false)}>İptal</button>
                                <button type='submit' style={styles.submitBtn}>Ekle</button>
                              </div>                           
                        </form>
                    </div>
                </div>
             )}
        </div>
    );
}

const styles = {
  container: { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', background: '#1e293b', borderBottom: '1px solid #334155' },
  logo: { fontSize: '22px', fontWeight: '800', color: '#f1f5f9' },
  accent: { color: '#6366f1' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '24px' },
  navLink: { color: '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  logoutBtn: { padding: '8px 16px', borderRadius: '8px', background: '#334155', color: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: '600' },
  content: { padding: '32px 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '700' },
  addBtn: { padding: '10px 20px', borderRadius: '8px', background: '#6366f1', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },
  tableCard: { background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '1px', borderBottom: '1px solid #334155' },
  td: { padding: '14px 12px', fontSize: '14px', borderBottom: '1px solid #0f172a' },
  coinBadge: { background: '#334155', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '13px' },
  typeBadge: { padding: '4px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '12px' },
  deleteBtn: { padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,107,107,0.15)', color: '#ff6b6b', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#1e293b', borderRadius: '12px', padding: '32px', width: '400px', border: '1px solid #334155' },
  modalTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  error: { color: '#f87171', fontSize: '13px' },
  suggestionsContainer: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', marginTop: '4px', zIndex: 10, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  suggestionItem: { padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #334155', fontSize: '14px' },
  modalBtns: { display: 'flex', gap: '12px', marginTop: '8px' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: '8px', background: '#334155', color: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: '600' },
  submitBtn: { flex: 1, padding: '12px', borderRadius: '8px', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f1f5f9', fontSize: '18px' },
};