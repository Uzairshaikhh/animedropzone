import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ContactUs() {
  const whatsappNumber = '919819291230';
  const instagramHandle = 'animedropzone';
  const instagramUrl = 'https://www.instagram.com/animedropzone/?igsh=eGM5Z24wbHM2bHR4#';
  const email = 'anime.drop.zone.00@gmail.com';

  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    question: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [showMyTickets, setShowMyTickets] = useState(false);

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/support/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(supportForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubmitMessage('✅ Your support ticket has been submitted! We will respond soon.');
        setSupportForm({ name: '', email: '', subject: '', question: '' });
        setTimeout(() => setSubmitMessage(''), 5000);
      } else {
        setSubmitMessage(`❌ ${data.error || 'Failed to submit ticket'}`);
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      setSubmitMessage('❌ Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadMyTickets = async () => {
    if (!supportForm.email) {
      alert('Please enter your email address first');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/support/my-tickets?email=${encodeURIComponent(supportForm.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMyTickets(data.tickets);
        setShowMyTickets(true);
      } else {
        alert('Failed to load tickets');
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      alert('Failed to load tickets');
    }
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Have questions? We're here to help! Reach out to us through any of these channels
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-white mb-6">Contact Information</h3>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white mb-1">Email</h4>
                  <a
                    href={`mailto:${email}`}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white mb-1">Phone</h4>
                  <a
                    href={`tel:+${whatsappNumber}`}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    +91 98192 91230
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white mb-1">Address</h4>
                  <p className="text-gray-400">
                    Jogeshwari West<br />
                    Mumbai, Maharashtra 400102<br />
                    India
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="space-y-3">
              <h4 className="text-white mb-4">Quick Connect</h4>
              
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-all group"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg transition-all group"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Follow on Instagram</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-500 px-6 py-3 rounded-lg transition-all group"
              >
                <Mail className="w-5 h-5" />
                <span>Send Email</span>
              </a>
            </div>
          </div>

          {/* Support Form */}
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-2xl p-8">
            <h3 className="text-white mb-6">Customer Support</h3>
            <form onSubmit={handleSubmitSupport} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  value={supportForm.name}
                  onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                  required
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                  required
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={supportForm.subject}
                  onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                  required
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="What do you need help with?"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Your Question</label>
                <textarea
                  value={supportForm.question}
                  onChange={(e) => setSupportForm({ ...supportForm, question: e.target.value })}
                  required
                  rows={5}
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Describe your issue or question..."
                />
              </div>

              {submitMessage && (
                <div className={`border rounded-lg p-3 ${
                  submitMessage.startsWith('✅') 
                    ? 'bg-green-900/20 border-green-500/30 text-green-400'
                    : 'bg-red-900/20 border-red-500/30 text-red-400'
                }`}>
                  {submitMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>

            {/* View My Tickets */}
            <div className="mt-6">
              <button
                onClick={loadMyTickets}
                className="w-full bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-500 py-3 rounded-lg transition-all"
              >
                View My Support Tickets
              </button>

              {showMyTickets && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-white">My Tickets</h4>
                  {myTickets.length > 0 ? (
                    myTickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-white">{ticket.subject}</h5>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            ticket.status === 'answered' 
                              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                              : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">Q: {ticket.question}</p>
                        {ticket.reply && (
                          <div className="mt-3 pt-3 border-t border-purple-500/30">
                            <p className="text-purple-300 text-sm">
                              <strong>Admin Reply:</strong> {ticket.reply}
                            </p>
                          </div>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No support tickets found for this email.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}