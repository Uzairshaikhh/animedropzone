import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { motion } from 'motion/react';

interface BulkResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export function BulkOperations() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [operation, setOperation] = useState<'add' | 'update'>('add');

  const downloadTemplate = () => {
    const csvContent = `name,description,price,category,subcategory,image,stock
Example Figure,Premium anime figure,2499,figures,Naruto,https://example.com/image.jpg,50
Example Katana,Authentic replica sword,4999,katana,Demon Slayer,https://example.com/image2.jpg,25`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadCurrentProducts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products/export-csv`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export products');
      }
    } catch (error) {
      console.error('Error exporting products:', error);
      alert('Failed to export products');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('operation', operation);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/products/bulk-import`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      } else {
        alert('Failed to process file: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white mb-2">Bulk Operations</h1>
        <p className="text-gray-400">Import or export products in bulk using CSV files</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Download Template */}
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">CSV Template</h3>
              <p className="text-gray-400 text-sm">Download sample format</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>
        </div>

        {/* Export Products */}
        <div className="bg-gradient-to-br from-black to-pink-900/20 border border-pink-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-pink-700 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white">Export Products</h3>
              <p className="text-gray-400 text-sm">Download current products</p>
            </div>
          </div>
          <button
            onClick={downloadCurrentProducts}
            className="w-full bg-pink-600 hover:bg-pink-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-6">Import Products</h2>
        
        {/* Operation Type */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-3">Operation Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="add"
                checked={operation === 'add'}
                onChange={(e) => setOperation(e.target.value as any)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">Add New Products</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="update"
                checked={operation === 'update'}
                onChange={(e) => setOperation(e.target.value as any)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="text-white">Update Existing Products</span>
            </label>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            {operation === 'add' 
              ? 'All products in the CSV will be added as new products'
              : 'Products will be matched by name and updated. New products will be skipped.'
            }
          </p>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
            disabled={uploading}
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            {uploading ? (
              <Loader className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
            ) : (
              <Upload className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            )}
            <p className="text-white mb-2">
              {uploading ? 'Processing...' : 'Click to upload CSV file'}
            </p>
            <p className="text-gray-400 text-sm">
              or drag and drop your CSV file here
            </p>
          </label>
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                )}
                <h3 className="text-white">Import Results</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm mb-1">Processed</p>
                  <p className="text-white text-2xl">{result.processed}</p>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm mb-1">Failed</p>
                  <p className="text-white text-2xl">{result.failed}</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-400 mb-2">Errors:</p>
                  <div className="bg-black/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-red-400 text-sm mb-2">
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-4">CSV Format Instructions</h2>
        <div className="space-y-3 text-gray-400">
          <p>• <strong className="text-white">Required columns:</strong> name, description, price, category, subcategory, image, stock</p>
          <p>• <strong className="text-white">name:</strong> Product name (required)</p>
          <p>• <strong className="text-white">description:</strong> Product description (required)</p>
          <p>• <strong className="text-white">price:</strong> Price in rupees (number only, e.g., 2499)</p>
          <p>• <strong className="text-white">category:</strong> figures, katana, accessories, posters, clothing, collectibles</p>
          <p>• <strong className="text-white">subcategory:</strong> Subcategory name (e.g., Naruto, One Piece)</p>
          <p>• <strong className="text-white">image:</strong> Full URL to product image</p>
          <p>• <strong className="text-white">stock:</strong> Number of units available</p>
          <p className="text-purple-400">💡 Tip: Download the template or export existing products to see the exact format</p>
        </div>
      </div>
    </div>
  );
}
