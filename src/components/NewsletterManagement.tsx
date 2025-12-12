import { useState, useEffect } from 'react';
import { Mail, Send, Users, Calendar, Eye, Edit2, Trash2, Plus } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { motion } from 'motion/react';

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  htmlContent: string;
  scheduledFor: string | null;
  sentAt: string | null;
  status: 'draft' | 'scheduled' | 'sent';
  recipientCount: number;
  openRate: number;
  clickRate: number;
}

interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export function NewsletterManagement() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    htmlContent: '',
    scheduledFor: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'subscribers'>('campaigns');

  useEffect(() => {
    fetchNewsletters();
    fetchSubscribers();
  }, []);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/newsletters`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setNewsletters(data.newsletters);
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/newsletter-subscribers`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.subscribers);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId
        ? `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/newsletters/${editingId}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/newsletters`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ subject: '', content: '', htmlContent: '', scheduledFor: '' });
        setEditingId(null);
        setShowForm(false);
        fetchNewsletters();
        alert('Newsletter saved successfully!');
      }
    } catch (error) {
      console.error('Error saving newsletter:', error);
      alert('Failed to save newsletter');
    }
  };

  const sendNewsletter = async (id: string) => {
    if (!confirm('Are you sure you want to send this newsletter to all subscribers?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/newsletters/${id}/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(`Newsletter sent to ${data.sentCount} subscribers!`);
        fetchNewsletters();
      } else {
        alert('Failed to send newsletter: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert('Failed to send newsletter');
    }
  };

  const deleteNewsletter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this newsletter?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/newsletters/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchNewsletters();
      }
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      alert('Failed to delete newsletter');
    }
  };

  const activeSubscribers = subscribers.filter(s => s.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white mb-2">Newsletter & Email Campaigns</h1>
          <p className="text-gray-400">Send promotional emails to your customers</p>
        </div>
        {!showForm && activeTab === 'campaigns' && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ subject: '', content: '', htmlContent: '', scheduledFor: '' });
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Campaign
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-purple-500" />
            <h3 className="text-white">Subscribers</h3>
          </div>
          <p className="text-3xl text-white">{activeSubscribers.length}</p>
          <p className="text-gray-400 text-sm">Active subscribers</p>
        </div>
        <div className="bg-gradient-to-br from-black to-pink-900/20 border border-pink-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-6 h-6 text-pink-500" />
            <h3 className="text-white">Campaigns</h3>
          </div>
          <p className="text-3xl text-white">{newsletters.filter(n => n.status === 'sent').length}</p>
          <p className="text-gray-400 text-sm">Emails sent</p>
        </div>
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-purple-500" />
            <h3 className="text-white">Scheduled</h3>
          </div>
          <p className="text-3xl text-white">{newsletters.filter(n => n.status === 'scheduled').length}</p>
          <p className="text-gray-400 text-sm">Upcoming campaigns</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-purple-900/30">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-6 py-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'campaigns'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <Mail className="w-5 h-5" />
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-6 py-3 flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'subscribers'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
        >
          <Users className="w-5 h-5" />
          Subscribers
        </button>
      </div>

      {activeTab === 'campaigns' && (
        <>
          {showForm ? (
            <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
              <h2 className="text-white mb-6">{editingId ? 'Edit' : 'Create'} Campaign</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="e.g., New arrivals this week!"
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Plain Text Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={6}
                    placeholder="Plain text version of your email..."
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">HTML Content (Optional)</label>
                  <textarea
                    value={formData.htmlContent}
                    onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                    rows={6}
                    placeholder="HTML version for rich formatting..."
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Schedule For (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-gray-500 text-sm mt-1">Leave empty to save as draft</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg transition-all"
                  >
                    {editingId ? 'Update' : 'Save'} Campaign
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {newsletters.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl">
                  <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No campaigns yet. Create your first one!</p>
                </div>
              ) : (
                newsletters.map((newsletter, index) => (
                  <motion.div
                    key={newsletter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white text-lg">{newsletter.subject}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            newsletter.status === 'sent' ? 'bg-green-600' :
                            newsletter.status === 'scheduled' ? 'bg-blue-600' :
                            'bg-gray-600'
                          }`}>
                            {newsletter.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{newsletter.content.substring(0, 100)}...</p>
                        {newsletter.sentAt && (
                          <div className="flex gap-6 text-sm">
                            <span className="text-gray-500">
                              Sent to {newsletter.recipientCount} subscribers
                            </span>
                            <span className="text-gray-500">
                              {new Date(newsletter.sentAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {newsletter.status === 'draft' && (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(newsletter.id);
                                setFormData({
                                  subject: newsletter.subject,
                                  content: newsletter.content,
                                  htmlContent: newsletter.htmlContent,
                                  scheduledFor: newsletter.scheduledFor || '',
                                });
                                setShowForm(true);
                              }}
                              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => sendNewsletter(newsletter.id)}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              title="Send Now"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteNewsletter(newsletter.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'subscribers' && (
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-white mb-6">Subscriber List</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left text-gray-400 py-3 px-4">Email</th>
                  <th className="text-left text-gray-400 py-3 px-4">Name</th>
                  <th className="text-left text-gray-400 py-3 px-4">Subscribed</th>
                  <th className="text-left text-gray-400 py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-purple-500/10 hover:bg-purple-900/10">
                    <td className="text-white py-3 px-4">{subscriber.email}</td>
                    <td className="text-gray-300 py-3 px-4">{subscriber.name}</td>
                    <td className="text-gray-300 py-3 px-4">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        subscriber.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {subscriber.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
