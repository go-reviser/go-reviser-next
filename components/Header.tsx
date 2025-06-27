import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

const Header = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
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
            <Link href="/" className={`${isActive('/')} transition-colors duration-200`}>
              Home
            </Link>
            {user && (
              <Link href="/dashboard" className={`${isActive('/dashboard')} transition-colors duration-200`}>
                Dashboard
              </Link>
            )}
            <Link href="/about" className={`${isActive('/about')} transition-colors duration-200`}>
              About
            </Link>
            <Link href="/contact" className={`${isActive('/contact')} transition-colors duration-200`}>
              Contact
            </Link>

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
                    <Link
                      href="/admin/subjects"
                      className={`block px-4 py-2 text-sm ${router.pathname === '/admin/subjects' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Subjects
                    </Link>
                    <Link
                      href="/admin/question-categories"
                      className={`block px-4 py-2 text-sm ${router.pathname === '/admin/question-categories' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Question Categories
                    </Link>
                    <Link
                      href="/admin/sub-categories"
                      className={`block px-4 py-2 text-sm ${router.pathname === '/admin/sub-categories' ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      Sub Categories
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
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
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md ${isActive('/')} transition-colors duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-md ${isActive('/dashboard')} transition-colors duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-md ${isActive('/about')} transition-colors duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`block px-3 py-2 rounded-md ${isActive('/contact')} transition-colors duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>

            {/* Mobile Admin Menu */}
            {user?.isAdmin && (
              <>
                <div className="px-3 py-2 font-medium text-gray-700">Admin Pages:</div>
                <Link
                  href="/admin/subjects"
                  className={`block px-3 py-2 pl-6 rounded-md ${router.pathname === '/admin/subjects' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    } transition-colors duration-200`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Subjects
                </Link>
                <Link
                  href="/admin/question-categories"
                  className={`block px-3 py-2 pl-6 rounded-md ${router.pathname === '/admin/question-categories' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    } transition-colors duration-200`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Question Categories
                </Link>
                <Link
                  href="/admin/sub-categories"
                  className={`block px-3 py-2 pl-6 rounded-md ${router.pathname === '/admin/sub-categories' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    } transition-colors duration-200`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sub Categories
                </Link>
              </>
            )}

            {user ? (
              <>
                <span className="block px-3 py-2 text-gray-700">Welcome, {user.name}</span>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="block px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header; 