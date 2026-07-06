import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Search, File, Loader2 } from 'lucide-react';
import api from '../api';

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFiles = () => {
    api.get('/files').then(res => setFiles(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    try {
      // Upload all selected files sequentially
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchFiles();
      
      // Vectorize documents
      setUploading(false);
      setProcessing(true);
      await api.post('/process');
      
    } catch (err) {
      console.error("Upload or processing failed", err);
      alert("Failed to process the documents. Please try again.");
    } finally {
      setUploading(false);
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (filename) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${filename}"?\n\nThis will permanently delete the file and automatically remove its contents from the Vector Database.`
    );
    
    if (!confirmDelete) return;

    setProcessing(true);
    try {
      await api.delete(`/files/${filename}`);
      fetchFiles();
      
      // Re-vectorize the remaining documents so the deleted file is removed from the brain
      await api.post('/process');
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete the document or update the database.");
    } finally {
      setProcessing(false);
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-5xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Documents</h1>
          <p className="text-slate-500">Manage medical documents for the RAG system.</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            multiple
            accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.yaml,.yml"
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={uploading || processing}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {processing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            <span>
              {uploading ? 'Uploading...' : processing ? 'Vectorizing...' : 'Upload Document'}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search documents by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="ml-auto text-sm text-slate-500">
            {filteredFiles.length} file(s)
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <File size={48} className="mb-4 opacity-20" />
              <p>No documents found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <div key={file.name} className="border border-slate-200 rounded-xl p-4 flex items-start space-x-4 hover:border-emerald-300 hover:shadow-md transition-all group bg-white">
                  <div className="p-3 bg-indigo-50 text-indigo-500 rounded-lg shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-700 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase">
                      {file.name.split('.').pop()} FILE
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(file.name)}
                    className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Delete file"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
