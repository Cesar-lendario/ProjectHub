
import React, { useState, useEffect, useRef } from 'react';
import { MenuIcon, ChevronDownIcon } from '../ui/Icons';
import { useProjectContext } from '../../hooks/useProjectContext';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { users } = useProjectContext();
  const currentUser = users[0]; // Mock current user
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="mr-4 text-slate-600 lg:hidden"
          aria-label="Abrir menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center">
        {currentUser && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 rounded-full p-1 hover:bg-slate-100"
            >
              <img
                className="h-9 w-9 rounded-full object-cover"
                src={currentUser.avatar}
                alt={currentUser.name}
              />
              <span className="hidden text-sm font-medium text-slate-700 sm:block">{currentUser.name}</span>
              <ChevronDownIcon className={`hidden h-5 w-5 text-slate-500 sm:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="py-1" role="none">
                  <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                    Meu Perfil
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                    Configurações
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                    Sair
                  </a>
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
