import React, { useState, useEffect } from 'react';
import { Database, FileText, Loader2, RefreshCw } from 'lucide-react';
import api from '../api';

export default function ChunksPage() {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState('All');

  const fetchChunks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chunks');
      setChunks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChunks();
  }, []);

  const uniqueFiles = Array.from(new Set(chunks.map(c => c.file_name)));
  const displayedChunks = selectedFile === 'All' ? chunks : chunks.filter(c => c.file_name === selectedFile);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Database size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 leading-tight">Database Chunks</h2>
            <p className="text-xs text-slate-500">Visualize vector store fragments</p>
          </div>
        </div>
        
        <button 
          onClick={fetchChunks}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {!loading && chunks.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <button
                onClick={() => setSelectedFile('All')}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  selectedFile === 'All' 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Documents
              </button>
              {uniqueFiles.map(file => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1.5 border ${
                    selectedFile === file
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText size={14} className={selectedFile === file ? 'text-emerald-100' : 'text-slate-400'} />
                  <span>{file}</span>
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
              <p>Loading chunks from Vector Database...</p>
            </div>
          ) : chunks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4 bg-white border border-slate-200 rounded-xl border-dashed">
              <Database size={48} className="text-slate-300" />
              <p className="font-medium text-slate-600">No chunks found</p>
              <p className="text-sm">Upload some documents to generate chunks.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedChunks.map((chunk, idx) => (
                <div key={chunk.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-wide uppercase border border-emerald-100">
                      <FileText size={12} className="mr-1.5" />
                      {chunk.file_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-100 overflow-y-auto max-h-64">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
                      {chunk.text}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 truncate max-w-[200px]" title={chunk.id}>
                      ID: {chunk.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {chunk.text.length} chars
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
