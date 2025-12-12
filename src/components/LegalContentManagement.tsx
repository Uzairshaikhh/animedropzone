import { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, Shield, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function LegalContentManagement() {
  const [activeDoc, setActiveDoc] = useState<'privacy' | 'terms'>('privacy');
  const [privacyContent, setPrivacyContent] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    fetchLegalContent();
  }, []);

  const fetchLegalContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/legal-content`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setPrivacyContent(data.privacy || '');
        setTermsContent(data.terms || '');
      }
    } catch (error) {
      console.error('Error fetching legal content:', error);
      showMessage('error', 'Failed to load legal content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/legal-content`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: activeDoc,
            content: activeDoc === 'privacy' ? privacyContent : termsContent,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        showMessage('success', `${activeDoc === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} updated successfully!`);
        setIsModified(false);
      } else {
        showMessage('error', data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving legal content:', error);
      showMessage('error', 'Failed to save legal content');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default content? This will discard all custom changes.')) {
      if (activeDoc === 'privacy') {
        setPrivacyContent('');
      } else {
        setTermsContent('');
      }
      setIsModified(true);
      showMessage('success', 'Content reset to default. Click Save to apply changes.');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleContentChange = (value: string) => {
    if (activeDoc === 'privacy') {
      setPrivacyContent(value);
    } else {
      setTermsContent(value);
    }
    setIsModified(true);
  };

  const currentContent = activeDoc === 'privacy' ? privacyContent : termsContent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white mb-2">Legal Content Management</h2>
          <p className="text-gray-400">Manage Privacy Policy and Terms of Service content</p>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-900/20 border-green-500/30 text-green-400' 
            : 'bg-red-900/20 border-red-500/30 text-red-400'
        } flex items-center gap-2`}>
          <AlertCircle className="w-5 h-5" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Document Tabs */}
      <div className="flex gap-4 border-b border-purple-900/30">
        <button
          onClick={() => setActiveDoc('privacy')}
          className={`px-6 py-3 flex items-center gap-2 transition-all border-b-2 ${
            activeDoc === 'privacy'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <Shield className="w-5 h-5" />
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveDoc('terms')}
          className={`px-6 py-3 flex items-center gap-2 transition-all border-b-2 ${
            activeDoc === 'terms'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <FileText className="w-5 h-5" />
          Terms of Service
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading legal content...</p>
        </div>
      ) : (
        <>
          {/* Editor */}
          <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-white mb-1">
                  {activeDoc === 'privacy' ? 'Privacy Policy Content' : 'Terms of Service Content'}
                </h3>
                <p className="text-sm text-gray-400">
                  {currentContent === '' 
                    ? 'Using default content. Add custom content to override the default.'
                    : 'Custom content is active. Leave empty to use default content.'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  title="Reset to default content"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !isModified}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <textarea
              value={currentContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={`Enter custom ${activeDoc === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} content here (supports plain text and HTML)...`}
              className="w-full h-96 bg-black/50 border border-purple-500/30 rounded-lg p-4 text-gray-300 font-mono text-sm focus:outline-none focus:border-purple-500 resize-y"
              style={{ minHeight: '400px' }}
            />

            {isModified && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>You have unsaved changes. Click "Save Changes" to apply them.</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-6">
            <h4 className="text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Instructions
            </h4>
            <ul className="text-gray-400 space-y-2 text-sm">
              <li>• <strong>Custom Content:</strong> Add your own content to override the default legal text</li>
              <li>• <strong>HTML Support:</strong> You can use HTML tags for formatting (headings, paragraphs, lists, etc.)</li>
              <li>• <strong>Default Content:</strong> Leave empty to use the built-in default legal content</li>
              <li>• <strong>Preview:</strong> Visit the actual pages to see how your changes look:
                <div className="ml-6 mt-2 space-y-1">
                  <a href="/privacy-policy" target="_blank" className="text-purple-400 hover:text-purple-300 block">
                    → View Privacy Policy Page
                  </a>
                  <a href="/terms-of-service" target="_blank" className="text-purple-400 hover:text-purple-300 block">
                    → View Terms of Service Page
                  </a>
                </div>
              </li>
              <li>• <strong>Best Practice:</strong> Include sections like Introduction, Contact Info, Last Updated date, etc.</li>
              <li>• <strong>Legal Compliance:</strong> Ensure your content complies with applicable laws and regulations</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
