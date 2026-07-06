import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MessageSquare, Settings, FolderOpen, Database, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ChatPage from './pages/ChatPage';
import FilesPage from './pages/FilesPage';
import SettingsPage from './pages/SettingsPage';
import ChunksPage from './pages/ChunksPage';

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { path: '/', icon: <MessageSquare size={20} />, label: 'Chat' },
    { path: '/files', icon: <FolderOpen size={20} />, label: 'Documents' },
    { path: '/chunks', icon: <Database size={20} />, label: 'Database' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white flex flex-col h-screen border-r border-slate-800 transition-all duration-300 relative shrink-0`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 bg-slate-800 border border-slate-700 text-slate-300 rounded-full p-1 hover:text-white hover:bg-slate-700 z-50 transition-colors shadow-sm"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className={`p-6 flex items-center ${isOpen ? 'justify-start' : 'justify-center px-0'} overflow-hidden mt-2`}>
        {isOpen ? (
          <div className="bg-white p-2 rounded-xl shadow-sm w-full flex items-center justify-center border border-slate-700/50">
            <img src="/main_icon.png" alt="Otofarma Logo" className="max-h-12 w-auto object-contain" />
          </div>
        ) : (
          <div className="bg-white p-1.5 rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-slate-700/50">
            <img src="/main_icon.png" alt="Otofarma Logo" className="w-8 h-8 object-contain" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-6 overflow-hidden">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={!isOpen ? item.label : undefined}
            className={`flex items-center ${isOpen ? 'space-x-3 px-4' : 'justify-center px-0'} py-3 rounded-xl transition-all duration-200 group ${
              location.pathname === item.path
                ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
            }`}
          >
            <div className={`shrink-0 transition-transform duration-200 ${location.pathname !== item.path && 'group-hover:scale-110'}`}>
              {item.icon}
            </div>
            {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>
      
      <div className={`p-4 text-xs text-slate-600 text-center whitespace-nowrap overflow-hidden transition-opacity duration-300 ${!isOpen ? 'opacity-0' : 'opacity-100'}`}>
        Powered by LlamaIndex
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/chunks" element={<ChunksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
