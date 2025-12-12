import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TestQuoteEmail() {
  const navigate = useNavigate();
  const [quotedPrice, setQuotedPrice] = useState('1499.00');
  
  // Sample data for preview
  const sampleRequest = {
    requestId: 'CCR-1234567890',
    customerInfo: {
      name: 'Test Customer',
      email: 'customer@example.com',
    },
    clothingDetails: {
      type: 'T-Shirt',
      size: 'L',
      color: 'Black',
      quantity: 2,
    },
  };

  const baseUrl = window.location.origin;
  const approveUrl = `${baseUrl}/approve-quote/custom-clothing:1234567890?action=approve`;
  const rejectUrl = `${baseUrl}/approve-quote/custom-clothing:1234567890?action=reject`;

  const quoteEmailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0a2e 0%, #7b2cbf 100%); border-radius: 16px; padding: 30px; }
          .header { background: linear-gradient(to right, #7b2cbf, #e91e63); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; }
          .content { background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; border: 1px solid rgba(123,44,191,0.3); }
          .label { color: #a855f7; font-weight: bold; }
          .value { color: #e5e5e5; }
          .price-box { background: linear-gradient(to right, #059669, #10b981); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
          .button-container { display: flex; gap: 15px; justify-content: center; margin: 30px 0; }
          .button { display: inline-block; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; text-align: center; }
          .approve-btn { background: linear-gradient(to right, #059669, #10b981); color: white; }
          .reject-btn { background: linear-gradient(to right, #dc2626, #e91e63); color: white; }
          .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
          @media only screen and (max-width: 600px) {
            .button-container { flex-direction: column; }
            .button { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: white;">💰 Your Custom Clothing Quote</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${sampleRequest.customerInfo.name},</p>
            <p>Great news! We've reviewed your custom clothing design and prepared a quote for you.</p>
            
            <div style="margin: 20px 0; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #7b2cbf; border-radius: 8px;">
              <p style="margin: 0;"><strong>Request ID:</strong> ${sampleRequest.requestId}</p>
            </div>
            
            <div class="price-box">
              <h2 style="margin: 0 0 10px 0; color: white; font-size: 36px;">₹${quotedPrice}</h2>
              <p style="margin: 0; color: white; opacity: 0.9;">Total Price (Including ₹100 shipping)</p>
            </div>
            
            <h3 style="color: #e91e63;">Your Order Details</h3>
            <p><span class="label">Clothing Type:</span> <span class="value">${sampleRequest.clothingDetails.type}</span></p>
            <p><span class="label">Size:</span> <span class="value">${sampleRequest.clothingDetails.size}</span></p>
            <p><span class="label">Color:</span> <span class="value">${sampleRequest.clothingDetails.color}</span></p>
            <p><span class="label">Quantity:</span> <span class="value">${sampleRequest.clothingDetails.quantity}</span></p>
            
            <h3 style="color: #e91e63; margin-top: 30px;">Please Respond to This Quote</h3>
            <p style="text-align: center; color: #e5e5e5; margin-bottom: 20px;">Click one of the buttons below to accept or decline this quote:</p>
            
            <div class="button-container">
              <a href="${approveUrl}" class="button approve-btn">✅ Accept Quote</a>
              <a href="${rejectUrl}" class="button reject-btn">❌ Decline Quote</a>
            </div>
            
            <h3 style="color: #e91e63; margin-top: 20px;">What Happens Next?</h3>
            <ol style="line-height: 1.8; color: #e5e5e5;">
              <li>Click "Accept Quote" if you're happy with the price</li>
              <li>We'll send you payment details within 24 hours</li>
              <li>Production will begin after payment confirmation</li>
              <li>Your custom clothing will be delivered to your address</li>
              <li>Delivery typically takes 7-14 business days</li>
            </ol>
            
            <div style="margin-top: 20px; padding: 15px; background: rgba(123,44,191,0.2); border-left: 4px solid #e91e63; border-radius: 8px;">
              <p style="margin: 0;">⏰ <strong>Quote Valid For:</strong> 7 days from today</p>
            </div>
          </div>
          <div class="footer">
            <p>AnimeDropZone - Embrace Your Inner Demon</p>
            <p>Questions? Reply to this email or contact us.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/secret-admin-panel-7b2cbf')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Admin
        </button>

        <h1 className="text-white text-3xl mb-4">Quote Email Preview</h1>
        <p className="text-gray-400 mb-6">
          This is how the customer will see the quote email with approval buttons.
        </p>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Adjust Quote Price (₹)</label>
          <input
            type="number"
            value={quotedPrice}
            onChange={(e) => setQuotedPrice(e.target.value)}
            className="bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
            step="0.01"
          />
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          <iframe
            srcDoc={quoteEmailHtml}
            className="w-full h-[800px] border-0"
            title="Email Preview"
          />
        </div>

        <div className="mt-6 bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <h3 className="text-white mb-2">Testing Instructions:</h3>
          <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
            <li>This preview shows exactly how the quote email will appear to customers</li>
            <li>The approval buttons will redirect to /approve-quote/:id page</li>
            <li>Customers can approve or reject with one click</li>
            <li>The status automatically updates in the database</li>
            <li><strong>Note:</strong> With Resend free plan, emails only work if sent to your verified email address</li>
          </ul>
        </div>
      </div>
    </div>
  );
}