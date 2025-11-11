import React, { useState, useEffect, useRef } from 'react';
import { MenuIcon, ChevronDownIcon } from '../ui/Icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onGoToProfile: () => void;
  onGoToSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, onGoToProfile, onGoToSettings }) => {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 transition-colors shadow-sm dark:shadow-black/20">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="mr-4 text-slate-600 dark:text-slate-200 lg:hidden hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Abrir menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</h1>
        {profile?.role === 'admin' && (
          <span className="ml-3 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 dark:ring-1 dark:ring-red-500/30">
            👑 ADMIN
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Botão de toggle tema */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-all"
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        {profile && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <img
                className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600"
                src={profile.avatar}
                alt={profile.name}
              />
              <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-100 sm:block">{profile.name}</span>
              <ChevronDownIcon className={`hidden h-5 w-5 text-slate-500 dark:text-slate-300 sm:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="py-1" role="none">
                  <button
                    onClick={() => {
                      onGoToProfile();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    role="menuitem"
                  >
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => {
                      onGoToSettings();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    role="menuitem"
                  >
                    Configurações
                  </button>
                  <button 
                    onClick={async () => {
                      await signOut();
                      setIsDropdownOpen(false);
                    }} 
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" 
                    role="menuitem"
                  >
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;