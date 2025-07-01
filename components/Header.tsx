import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AuthContextType } from '@/lib/contexts/AuthContext';

const Header = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const { user, signOut }: AuthContextType = useAuth();
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return router.pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600';
  };

  const isAdminActive = (path: string) => {
    return router.pathname === path ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100';
  };

  const isMobileAdminActive = (path: string) => {
    return router.pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleAdminMenu = () => {
    setIsAdminMenuOpen(!isAdminMenuOpen);
  };

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigation links data
  const navLinks = [
    { href: '/', label: 'Home', requireAuth: false },
    { href: '/dashboard', label: 'Dashboard', requireAuth: true },
    { href: '/about', label: 'About', requireAuth: false },
    { href: '/contact', label: 'Contact', requireAuth: false },
  ];

  // Admin links data
  const adminLinks = [
    { href: '/admin/subjects', label: 'Subjects' },
    { href: '/admin/question-categories', label: 'Question Categories' },
    { href: '/admin/sub-categories', label: 'Sub Categories' },
  ];

  // Navigation Links Component
  const NavLinks = ({ mobile = false, onClickLink = () => { } }) => (
    <>
      {navLinks.map((link) => (
        (!link.requireAuth || (link.requireAuth && user)) && (
          <Link
            key={link.href}
            href={link.href}
            className={`${mobile ? 'block px-3 py-2 rounded-md' : ''} ${isActive(link.href)} transition-colors duration-200`}
            onClick={onClickLink}
          >
            {link.label}
          </Link>
        )
      ))}
    </>
  );

  // Admin Links Component
  const AdminLinks = ({ mobile = false, onClickLink = () => { } }) => (
    <>
      {adminLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${mobile
            ? `block px-3 py-2 pl-6 rounded-md ${isMobileAdminActive(link.href)}`
            : `block px-4 py-2 text-sm ${isAdminActive(link.href)}`
            } transition-colors duration-200`}
          onClick={onClickLink}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  // Auth UI Component
  const AuthUI = ({ mobile = false, onSignOut = () => { } }) => (
    <>
      {user ? (
        <>
          <span className={`${mobile ? 'block px-3 py-2' : ''} text-gray-700`}>Welcome, {user.name}</span>
          <button
            onClick={() => {
              signOut();
              onSignOut();
            }}
            className={`${mobile
              ? 'block w-full text-left px-3 py-2 rounded-md'
              : 'px-4 py-2 rounded-md'
              } bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200`}
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link
            href="/signin"
            className={`${mobile
              ? 'block px-3 py-2 rounded-md'
              : 'px-4 py-2'
              } text-gray-600 hover:text-blue-600 transition-colors duration-200`}
            onClick={onSignOut}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className={`${mobile
              ? 'block px-3 py-2 rounded-md'
              : 'px-4 py-2'
              } bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200`}
            onClick={onSignOut}
          >
            Sign Up
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white shadow-md w-full">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
              GO Reviser
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />

            {/* Admin Dropdown Menu */}
            {user?.isAdmin && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  onClick={toggleAdminMenu}
                  className={`flex items-center ${router.pathname.startsWith('/admin') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    } transition-colors duration-200 focus:outline-none`}
                >
                  Admin
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${isAdminMenuOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isAdminMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <AdminLinks onClickLink={() => setIsAdminMenuOpen(false)} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <AuthUI />
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              // Close icon
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            ) : (
              // Menu icon
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } md:hidden overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLinks mobile onClickLink={() => setIsMobileMenuOpen(false)} />

            {/* Mobile Admin Menu */}
            {user?.isAdmin && (
              <>
                <div className="px-3 py-2 font-medium text-gray-700">Admin Pages:</div>
                <AdminLinks mobile onClickLink={() => setIsMobileMenuOpen(false)} />
              </>
            )}

            <AuthUI mobile onSignOut={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 