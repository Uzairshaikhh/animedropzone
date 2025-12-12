import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function AdminStorageFix() {
  const [fixing, setFixing] = useState(false);
  const [message, setMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);

  const handleFixStorage = async () => {
    setFixing(true);
    setMessage('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/admin/fix-storage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setShowInstructions(false);
      } else {
        setMessage(`❌ ${data.error || 'Failed to fix storage'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-black border-2 border-purple-500 rounded-lg max-w-2xl w-full p-6 shadow-2xl">
        <h2 className="text-2xl mb-4 text-purple-300">
          🔧 Storage RLS Fix
        </h2>

        {showInstructions && (
          <div className="bg-black/50 border border-purple-500/30 rounded p-4 mb-4 text-sm">
            <p className="text-purple-200 mb-3">
              <strong>Issue:</strong> Supabase Storage has Row-Level Security (RLS) enabled without proper policies.
            </p>
            
            <p className="text-purple-200 mb-3">
              <strong>Quick Fix Option 1 - Automatic (Try this first):</strong>
            </p>
            <p className="text-gray-300 mb-4">
              Click the button below to attempt an automatic fix.
            </p>

            <p className="text-purple-200 mb-3">
              <strong>Manual Fix Option 2 - If automatic fails:</strong>
            </p>
            <ol className="text-gray-300 space-y-2 mb-4 ml-4 list-decimal">
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to Storage → product-images bucket</li>
              <li>Click &quot;Policies&quot; tab</li>
              <li>Click &quot;New Policy&quot;</li>
              <li>Choose &quot;For full customization&quot;</li>
              <li>Policy name: &quot;Allow all operations&quot;</li>
              <li>Target roles: Check &quot;public&quot;</li>
              <li>Policy command: &quot;All&quot;</li>
              <li>USING expression: <code className="bg-purple-900/50 px-2 py-1 rounded">true</code></li>
              <li>WITH CHECK expression: <code className="bg-purple-900/50 px-2 py-1 rounded">true</code></li>
              <li>Click &quot;Review&quot; then &quot;Save policy&quot;</li>
            </ol>

            <p className="text-purple-200 mb-2">
              <strong>Or run this SQL in Supabase SQL Editor:</strong>
            </p>
            <pre className="bg-black/70 p-3 rounded text-xs text-green-400 overflow-x-auto border border-purple-500/30">
{`CREATE POLICY "Allow all operations on product-images"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');`}
            </pre>
          </div>
        )}

        <button
          onClick={handleFixStorage}
          disabled={fixing}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg transition-all"
        >
          {fixing ? 'Fixing...' : '🔧 Try Automatic Fix'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded border ${
            message.includes('✅') 
              ? 'bg-green-900/30 border-green-500 text-green-300' 
              : 'bg-red-900/30 border-red-500 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-all"
        >
          Close & Reload
        </button>
      </div>
    </div>
  );
}
