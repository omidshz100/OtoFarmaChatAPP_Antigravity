import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api';

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'claude', label: 'Anthropic Claude' },
  { id: 'gemini', label: 'Google Gemini' },
  { id: 'ollama', label: 'Ollama (Local)' },
  { id: 'lmstudio', label: 'LM Studio (Local)' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    api_key: '',
    base_url: 'http://localhost:11434',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/settings').then(res => {
      setSettings(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to load settings.' });
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      await api.post('/settings', settings);
      setStatus({ type: 'success', message: 'Settings saved successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to save settings.' });
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  const requiresApiKey = ['openai', 'claude', 'gemini'].includes(settings.provider);
  const requiresBaseUrl = ['ollama', 'lmstudio'].includes(settings.provider);

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Configuration</h1>
      <p className="text-slate-500 mb-8">Set up your LLM provider to power the medical RAG system.</p>

      {status.message && (
        <div className={`p-4 rounded-lg mb-6 flex items-center space-x-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">LLM Provider</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROVIDERS.map(p => (
              <label 
                key={p.id} 
                className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${settings.provider === p.id ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-emerald-300'}`}
              >
                <input 
                  type="radio" 
                  name="provider" 
                  value={p.id} 
                  checked={settings.provider === p.id} 
                  onChange={handleChange}
                  className="sr-only" 
                />
                <span className={`text-sm font-medium ${settings.provider === p.id ? 'text-emerald-700' : 'text-slate-600'}`}>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Model Name</label>
          <input 
            type="text" 
            name="model" 
            value={settings.model} 
            onChange={handleChange} 
            placeholder={requiresApiKey ? "e.g., gpt-4o, claude-3-opus-20240229" : "e.g., llama3, mistral"}
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
            required
          />
          <p className="text-xs text-slate-500 mt-2">Specify the exact model identifier for your chosen provider.</p>
        </div>

        {requiresApiKey && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
            <input 
              type="password" 
              name="api_key" 
              value={settings.api_key || ''} 
              onChange={handleChange} 
              placeholder="sk-..."
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              required={requiresApiKey}
            />
          </div>
        )}

        {requiresBaseUrl && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Base URL</label>
            <input 
              type="text" 
              name="base_url" 
              value={settings.base_url || ''} 
              onChange={handleChange} 
              placeholder="http://localhost:11434"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              required={requiresBaseUrl}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">System Prompt</label>
          <textarea 
            name="system_prompt" 
            value={settings.system_prompt || ''} 
            onChange={handleChange} 
            placeholder="e.g., You are a helpful AI assistant."
            rows="3"
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-y"
          ></textarea>
          <p className="text-xs text-slate-500 mt-2">Set custom instructions to guide the AI's behavior.</p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Save size={18} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
