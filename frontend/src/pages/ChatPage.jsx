import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, FileText, Loader2, Sparkles } from 'lucide-react';
import api from '../api';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the Otofarma AI Assistant. Ask me anything about Otofarma or your uploaded documents.' }
  ]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('all');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/files').then(res => setFiles(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const payload = {
        message: userMessage,
        document_ids: selectedFile === 'all' ? null : [selectedFile]
      };
      
      const res = await api.post('/chat', payload);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response, sources: res.data.sources }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please check your LLM settings and ensure documents are uploaded.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 leading-tight">Otofarma AI Assistant</h2>
            <p className="text-xs text-slate-500">Ready to answer your questions</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <FileText size={16} className="text-slate-400" />
          <select 
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Documents</option>
            {files.map(f => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start space-x-4 max-w-4xl animate-slide-up ${msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
            </div>
            <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium mb-2 uppercase tracking-wider">Source Documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-slate-50 text-slate-600 text-[11px] font-medium border border-slate-200">
                        <FileText size={10} className="mr-1.5" />
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start space-x-4 max-w-4xl mr-auto animate-slide-up">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm rounded-tl-sm">
              <div className="flex space-x-2 items-center text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={files.length === 0 ? "Please upload documents first..." : "Ask a question..."}
              disabled={files.length === 0}
              className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-inner disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading || files.length === 0}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-full transition-colors flex items-center justify-center"
            >
              <Send size={18} className={input.trim() && !loading ? "translate-x-0.5" : ""} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[11px] text-slate-400">Otofarma AI can make mistakes. Consider verifying critical information.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
