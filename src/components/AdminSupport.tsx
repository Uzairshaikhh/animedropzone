import { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useToast } from '../contexts/ToastContext';

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  question: string;
  status: 'pending' | 'answered';
  reply: string | null;
  createdAt: string;
  updatedAt: string;
}

export function AdminSupport() {
  const { success, error: showError } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/support/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets);
      } else {
        console.error('Failed to load tickets:', data.error);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleReply = async (ticketId: string) => {
    const reply = replyText[ticketId];
    if (!reply || !reply.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/support/reply`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticketId, reply }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setReplyText({ ...replyText, [ticketId]: '' });
        loadTickets();
        success('✅ Reply sent successfully! Customer will receive an email notification.', 5000);
      } else {
        showError('Failed to send reply: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      showError('Failed to send reply');
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/support/${ticketId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        loadTickets();
        success('Ticket deleted successfully!');
      } else {
        showError('Failed to delete ticket: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      showError('Failed to delete ticket');
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const answeredCount = tickets.filter((t) => t.status === 'answered').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Customer Support Tickets
        </h2>
        <button
          onClick={loadTickets}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-900/30 to-black border border-purple-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Tickets</p>
          <p className="text-white text-2xl mt-1">{tickets.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-black border border-yellow-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-yellow-400 text-2xl mt-1">{pendingCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-black border border-green-500/30 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Answered</p>
          <p className="text-green-400 text-2xl mt-1">{answeredCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-900/30 text-gray-400 hover:bg-purple-900/50'
          }`}
        >
          All ({tickets.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-900/30 text-gray-400 hover:bg-yellow-900/50'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('answered')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'answered'
              ? 'bg-green-600 text-white'
              : 'bg-green-900/30 text-gray-400 hover:bg-green-900/50'
          }`}
        >
          Answered ({answeredCount})
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No tickets found</div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-lg p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white">{ticket.subject}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        ticket.status === 'answered'
                          ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>From: {ticket.name}</span>
                    <span>Email: {ticket.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(ticket.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                  title="Delete ticket"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Question */}
              <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 mb-4">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{ticket.question}</p>
              </div>

              {/* Existing Reply */}
              {ticket.reply && (
                <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4 mb-4">
                  <p className="text-green-300 text-sm mb-1">
                    <strong>Your Reply:</strong>
                  </p>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{ticket.reply}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Replied: {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Reply Form */}
              <div className="flex gap-2">
                <textarea
                  value={replyText[ticket.id] || ''}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [ticket.id]: e.target.value })
                  }
                  placeholder={ticket.reply ? 'Update your reply...' : 'Type your reply...'}
                  className="flex-1 bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
                />
                <button
                  onClick={() => handleReply(ticket.id)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg transition-all flex items-center gap-2 self-end"
                >
                  <Send className="w-4 h-4" />
                  {ticket.reply ? 'Update' : 'Send'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}