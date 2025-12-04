import React, { useState, useRef, useEffect } from 'react';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface ProfileDropDownProps {
  username: string;
  onLogout: () => void;
  isGoogleLoggedIn: boolean;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
}

const ProfileDropDown: React.FC<ProfileDropDownProps> = ({ username, onLogout, isGoogleLoggedIn, onGoogleLogin, onGoogleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <UserIcon />
        <span className="sr-only">Open user menu</span>
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300" role="none">
                Signed in as
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate" role="none">
                {username}
              </p>
            </div>

            {isGoogleLoggedIn ? (
               <button
                onClick={onGoogleLogout}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <GoogleIcon />
                Disconnect Google
              </button>
            ) : (
              <button
                onClick={onGoogleLogin}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <GoogleIcon />
                Connect to Google
              </button>
            )}

            <button
              onClick={onLogout}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
              role="menuitem"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropDown;