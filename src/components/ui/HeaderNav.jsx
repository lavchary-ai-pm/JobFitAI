import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const HeaderNav = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/analysis-dashboard');
  };

  const handleSettingsClick = () => {
    window.dispatchEvent(new CustomEvent('openSettingsModal'));
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header-nav">
      <div className="header-content">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogoClick}
            className="header-logo"
            aria-label="JobFit AI Home">

            <div className="header-logo-icon">
              <Icon name="Target" size={20} color="#FFFFFF" />
            </div>
            <span className="header-logo-text hidden sm:inline">JobFit AI</span>
          </button>
        </div>

        <div className="header-actions">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="md:hidden hover:bg-muted"
            aria-label="Toggle mobile menu">

            <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
          </Button>
        </div>
      </div>

      {mobileMenuOpen &&
      <>
          <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1500] md:hidden"
          onClick={() => setMobileMenuOpen(false)} />

          <div className="fixed top-[64px] right-0 w-72 h-[calc(100vh-64px)] bg-card border-l border-border z-[1501] md:hidden animate-slide-in-right">
            <nav className="flex flex-col p-5 gap-2">
              <button
              onClick={handleSettingsClick}
              className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-all duration-200">

                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Icon name="Settings" size={18} />
                </div>
                Settings
              </button>
              <div className="border-t border-border my-3" />
              <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-all duration-200">

                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Icon name="LogOut" size={18} />
                </div>
                Sign Out
              </button>
            </nav>
          </div>
        </>
      }
    </header>);

};

export default HeaderNav;