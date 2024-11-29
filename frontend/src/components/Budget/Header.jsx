import React from 'react';
import { Menu, X, ChevronLeft, ChevronRight, DollarSign, Wallet, PieChart } from 'lucide-react';

const NavItem = ({ section, icon: Icon, label, activeSection, onClick }) => (
  <button
    onClick={() => onClick(section)}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors w-full md:w-auto
      ${activeSection === section ? "bg-blue-700 text-white" : "hover:bg-blue-700/10 text-blue-50"}`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </button>
);

const Header = ({ activeSection, handleNavigation, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen }) => (
  <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white z-40 sticky top-0">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-14">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-blue-700/20 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          <h2 className="text-lg font-semibold">Budget Tracker</h2>
        </div>

        <nav className="hidden md:flex space-x-2">
          <NavItem section="tracker" icon={DollarSign} label="Budget" activeSection={activeSection} onClick={handleNavigation} />
          <NavItem section="income" icon={Wallet} label="Income" activeSection={activeSection} onClick={handleNavigation} />
          <NavItem section="reports" icon={PieChart} label="Reports" activeSection={activeSection} onClick={handleNavigation} />
        </nav>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-blue-700/20 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden py-2 space-y-1">
          <NavItem section="tracker" icon={DollarSign} label="Budget" activeSection={activeSection} onClick={handleNavigation} />
          <NavItem section="income" icon={Wallet} label="Income" activeSection={activeSection} onClick={handleNavigation} />
          <NavItem section="reports" icon={PieChart} label="Reports" activeSection={activeSection} onClick={handleNavigation} />
        </div>
      )}
    </div>
  </header>
);

export default Header; 