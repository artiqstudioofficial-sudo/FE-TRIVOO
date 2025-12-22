import { Heart, LogOut, Menu, Sparkles, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useWishlist } from '../components/WishlistContext';
import { authService } from '../services/authService';
import { UserRole } from '../types';

const PublicLayout: React.FC = () => {
  const { user, logout, updateUser } = useAuth(); // ✅ butuh updateUser
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ✅ biar ga double-call (React 18 strict mode dev)
  const didFetchMeRef = useRef(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ AUTO REFRESH USER dari session (Redis) setiap layout mount / route berubah
  useEffect(() => {
    // kalau user sudah ada, tetap boleh refresh untuk update avatar terbaru
    // tapi jangan spam terus-terusan; cukup 1x per mount
    if (didFetchMeRef.current) return;
    didFetchMeRef.current = true;

    (async () => {
      try {
        // authService.me() harus pakai credentials include (session cookie)
        const me = await authService.me();

        // Bentuk response kamu bisa:
        // - { user: {...} }
        // - atau langsung {...user}

        // ✅ merge ke user context
        updateUser({
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          avatar: me.avatar, // penting buat navbar
          specialization: me.specialization ?? null,
          verificationStatus: me.verificationStatus,
        });
      } catch (err: any) {
        // Kalau 401 berarti session sudah expired / belum login
        // Jadi bersihin state (biar UI konsisten)
        const status = err?.response?.status;
        if (status === 401) logout();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigateToDashboard = () => {
    if (user?.role === UserRole.ADMIN) navigate('/admin');
    if (user?.role === UserRole.AGENT) navigate('/agent');
    if (user?.role === UserRole.CUSTOMER) navigate('/my-bookings');
  };

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      {/* Navigation - Glassmorphism */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out border-b ${
          scrolled || !isHome
            ? 'bg-white/95 backdrop-blur-md border-gray-100 shadow-sm py-3'
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group relative z-10">
                <span
                  className={`text-2xl md:text-3xl font-serif font-bold tracking-tighter transition-colors ${
                    scrolled || !isHome ? 'text-primary-800' : 'text-white'
                  }`}
                >
                  trivgoo<span className="text-accent-500">.</span>
                </span>
              </Link>

              <div className="hidden md:ml-12 md:flex md:space-x-8">
                {['Home', 'Explore'].map((item) => (
                  <Link
                    key={item}
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className={`inline-flex items-center text-sm font-medium transition-colors hover:text-accent-500 ${
                      scrolled || !isHome ? 'text-gray-600' : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {item}
                  </Link>
                ))}

                <Link
                  to="/ai-planner"
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    scrolled || !isHome
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 ring-1 ring-primary-100'
                      : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border border-white/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  AI Planner
                </Link>
              </div>
            </div>

            <div className="hidden md:flex md:items-center space-x-4">
              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className={`p-2 rounded-full transition-colors relative group ${
                  scrolled || !isHome
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/20'
                }`}
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-4 pl-2 border-l border-gray-200/20">
                  <button
                    onClick={navigateToDashboard}
                    className={`flex items-center text-sm font-medium transition-colors group ${
                      scrolled || !isHome
                        ? 'text-gray-700 hover:text-primary-600'
                        : 'text-white hover:text-primary-200'
                    }`}
                  >
                    <img
                      className="h-9 w-9 rounded-full border-2 border-white shadow-sm mr-2 object-cover group-hover:border-primary-200 transition-colors"
                      src={user.avatar || '/default-avatar.png'}
                      alt=""
                    />
                    <span>{user.name}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-full transition-colors ${
                      scrolled || !isHome
                        ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3 pl-2 border-l border-gray-200/20">
                  <Link
                    to="/login"
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                      scrolled || !isHome
                        ? 'text-gray-600 hover:text-primary-600'
                        : 'text-white hover:text-primary-100'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    className="bg-accent-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-accent-500/20 hover:bg-accent-600 hover:shadow-accent-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center md:hidden">
              <Link
                to="/wishlist"
                className={`mr-4 p-2 ${scrolled || !isHome ? 'text-gray-600' : 'text-white'}`}
              >
                <Heart className="w-6 h-6" />
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors ${
                  scrolled || !isHome
                    ? 'text-gray-500 hover:bg-gray-100'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-xl border-t absolute w-full left-0 top-full">
            <div className="pt-2 pb-6 space-y-1 px-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="bg-primary-50 text-primary-700 block px-4 py-3 rounded-lg text-base font-medium mt-2"
              >
                Home
              </Link>
              <Link
                to="/explore"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium"
              >
                Explore
              </Link>
              <Link
                to="/ai-planner"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium"
              >
                AI Planner
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between"
              >
                Wishlist
                {wishlist.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {!user ? (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-center items-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-center items-center px-4 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center px-4 py-2">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={user.avatar || '/default-avatar.png'}
                      alt=""
                    />
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full">
        <Outlet />
      </main>

      {/* Footer (unchanged) */}
      <footer className="bg-gray-900 text-white pt-20 pb-10">
        {/* ... footer kamu persis 그대로 ... */}
      </footer>
    </div>
  );
};

export default PublicLayout;
