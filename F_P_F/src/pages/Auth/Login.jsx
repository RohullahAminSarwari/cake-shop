import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const lockUntil = localStorage.getItem('loginLockUntil');
    if (lockUntil) {
      const lockTime = new Date(lockUntil);
      if (lockTime > new Date()) {
        setIsLocked(true);
        const interval = setInterval(() => {
          const now = new Date();
          if (lockTime <= now) { setIsLocked(false); setLockTimeLeft(0); localStorage.removeItem('loginLockUntil'); clearInterval(interval); }
          else setLockTimeLeft(Math.floor((lockTime - now) / 1000));
        }, 1000);
      } else { localStorage.removeItem('loginLockUntil'); setAttempts(0); }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('rememberedEmail');
    if (stored) { setEmail(stored); setRemember(true); }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLocked) { setError('Account temporarily locked.'); setLoading(false); return; }
    if (!AuthService.validateEmail(email)) { setError('Please enter a valid email'); setLoading(false); return; }
    if (!password) { setError('Please enter your password'); setLoading(false); return; }

    const result = await login({ email, password, remember });

    if (result.success) {
      setAttempts(0);
      localStorage.removeItem('loginAttempts');
      if (remember) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');
      navigate(from, { replace: true });
    } else {
      const n = attempts + 1;
      setAttempts(n);
      if (n >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        localStorage.setItem('loginLockUntil', lockUntil.toISOString());
        setIsLocked(true);
        setError('Too many attempts. Try again in 15 minutes.');
      } else {
        if (result.error_code === 'INVALID_CREDENTIALS') setError(`Invalid email or password. ${5 - n} attempt${5 - n > 1 ? 's' : ''} remaining.`);
        else setError(result.error || 'Login failed');
      }
    }
    setLoading(false);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8 bg-cream-100">
      <div className="w-full max-w-5xl card overflow-hidden grid lg:grid-cols-2 min-h-[600px]">
        {/* Left — Image Panel */}
        <div className="hidden lg:flex relative bg-bark-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-bark-950/80 via-bark-950/30 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80"
            alt="Bakery"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 flex flex-col justify-end p-10">
            <h2 className="font-display text-4xl text-white leading-tight">
              The Modern<br />Patisserie
            </h2>
            <p className="text-cream-300 text-sm mt-3 leading-relaxed max-w-xs">
              Crafting moments of sweetness with artisanal precision and a dash of heart.
            </p>
          </div>
        </div>

        {/* Right — Form Panel */}
        <div className="flex flex-col justify-center px-8 sm:px-12 py-12">
          <div className="max-w-sm mx-auto w-full">
            <h1 className="font-display text-3xl text-bark-950 mb-2">Welcome Back</h1>
            <p className="text-sm text-bark-500 mb-8">Please enter your details to access your sweet rewards.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {isLocked && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-amber-700">Locked. Try again in {formatTime(lockTimeLeft)}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-bark-800 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bark-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  </span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" disabled={isLocked}
                    className="input-field pl-11" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-bark-800">Password</label>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-bark-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  </span>
                  <input type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isLocked}
                    className="input-field pl-11 pr-11" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-bark-400 hover:text-bark-600 transition-colors">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={isLocked}
                    className="w-4 h-4 rounded border-cream-400 text-terra-700 focus:ring-terra-500" />
                  <span className="text-sm text-bark-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-terra-700 hover:text-terra-800 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading || isLocked} className="btn-primary w-full py-3.5 text-base">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Login'}
              </button>
            </form>

            <p className="text-center text-sm text-bark-500 mt-8">
              New to the bakery?{' '}
              <Link to="/register" className="font-semibold text-terra-700 hover:text-terra-800 transition-colors">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
