import React, { useState } from 'react';
import { loginApi } from '../api/auth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginApi({ email, password });
      
      // Simpan Token & Data User di LocalStorage
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));

      // Redirect ke Halaman Dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.logo}>R</div>
          <div>
            <div style={styles.title}>Student Academic</div>
            <div style={styles.subtitle}>Academic Portal</div>
          </div>
        </div>

        <div style={styles.header}>
          <h2 style={styles.heading}>Selamat Datang Kembali!</h2>
          <p style={styles.subheading}>Masukkan akun kamu untuk masuk ke portal akademik.</p>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Alamat Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Kata Sandi</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk ke Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '420px',
    padding: '36px 30px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  logo: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
    color: '#fff',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  title: { fontSize: '18px', fontWeight: 700, color: '#1e293b' },
  subtitle: { fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' },
  header: { marginBottom: '24px' },
  heading: { fontSize: '22px', color: '#0f172a', marginBottom: '6px' },
  subheading: { fontSize: '14px', color: '#64748b' },
  alertError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
  },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
    color: '#ffffff',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '10px',
  },
};