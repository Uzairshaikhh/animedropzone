// This file contains payment management endpoint handlers
// These will be imported into the main server file

export async function recordPaymentHandler(c: any, kv: any, sendEmail: any, sendWhatsApp: any) {
  try {
    const { orderId, amount, method, note } = await c.req.json();

    if (!orderId || !amount) {
      return c.json({ success: false, message: 'Order ID and amount are required' }, 400);
    }

    // Get the order
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ success: false, message: 'Order not found' }, 404);
    }

    // Initialize payment tracking fields if they don't exist
    const amountPaid = (order.amountPaid || 0) + parseFloat(amount);
    const amountDue = order.total - amountPaid;
    const paymentStatus = amountDue <= 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid';

    // Create payment history entry
    const paymentEntry = {
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      method: method || 'cash',
      note: note || '',
      recordedBy: 'admin',
    };

    const paymentHistory = order.paymentHistory || [];
    paymentHistory.push(paymentEntry);

    // Update order
    const updatedOrder = {
      ...order,
      amountPaid,
      amountDue,
      paymentStatus,
      paymentHistory,
    };

    await kv.set(`order:${orderId}`, updatedOrder);

    // Send email notification to customer
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">💰 Payment Received</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Payment Confirmation</h2>
          <p style="color: #666;">Hi ${order.customerInfo.name},</p>
          <p style="color: #666;">We have received a payment for your order.</p>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #9333ea; margin-top: 0;">Payment Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
            <p><strong>Payment Amount:</strong> ₹${parseFloat(amount).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${method}</p>
            ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #9333ea; margin-top: 0;">Order Summary</h3>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span style="color: #666;">Total Amount:</span>
              <span style="color: #333;">₹${order.total.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
              <span style="color: #10b981;">Amount Paid:</span>
              <span style="color: #10b981; font-weight: bold;">₹${amountPaid.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 8px 0; padding-top: 8px; border-top: 2px solid #9333ea;">
              <span style="color: ${amountDue <= 0 ? '#10b981' : '#dc2626'}; font-weight: bold;">Amount Due:</span>
              <span style="color: ${amountDue <= 0 ? '#10b981' : '#dc2626'}; font-weight: bold;">₹${amountDue.toLocaleString()}</span>
            </div>
          </div>

          ${amountDue <= 0 ? `
            <div style="background: #d1fae5; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="color: #065f46; margin: 0;">
                ✅ <strong>Payment Complete!</strong> Your order is fully paid.
              </p>
            </div>
          ` : ''}

          <p style="color: #666;">Thank you for your payment!</p>
        </div>
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0;">© 2025 animedropzone. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendEmail(
      order.customerInfo.email,
      `Payment Received - ₹${parseFloat(amount).toLocaleString()}`,
      emailHtml
    );

    // Send WhatsApp notification
    const whatsappMessage = `💰 *PAYMENT RECEIVED*

Order: #${order.trackingId}
Amount Paid: ₹${parseFloat(amount).toLocaleString()}
Method: ${method}
${note ? `Note: ${note}\n` : ''}
*Order Summary:*
Total: ₹${order.total.toLocaleString()}
Paid: ₹${amountPaid.toLocaleString()}
Due: ₹${amountDue.toLocaleString()}

${amountDue <= 0 ? '✅ Order is now fully paid!' : `Remaining balance: ₹${amountDue.toLocaleString()}`}

Thank you!`;

    await sendWhatsApp(order.customerInfo.phone, whatsappMessage);

    return c.json({ success: true, message: 'Payment recorded successfully', order: updatedOrder });
  } catch (error) {
    console.log('Error recording payment:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
}

export async function markPaidHandler(c: any, kv: any, sendEmail: any, sendWhatsApp: any) {
  try {
    const { orderId } = await c.req.json();

    if (!orderId) {
      return c.json({ success: false, message: 'Order ID is required' }, 400);
    }

    // Get the order
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ success: false, message: 'Order not found' }, 404);
    }

    const amountDue = order.amountDue !== undefined ? order.amountDue : order.total;

    // Create payment history entry for the remaining balance
    if (amountDue > 0) {
      const paymentEntry = {
        amount: amountDue,
        date: new Date().toISOString(),
        method: 'admin-marked-paid',
        note: 'Order marked as fully paid by admin',
        recordedBy: 'admin',
      };

      const paymentHistory = order.paymentHistory || [];
      paymentHistory.push(paymentEntry);

      const updatedOrder = {
        ...order,
        amountPaid: order.total,
        amountDue: 0,
        paymentStatus: 'paid',
        paymentHistory,
      };

      await kv.set(`order:${orderId}`, updatedOrder);

      // Send email notification
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #9333ea 0%, #10b981 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Order Fully Paid</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Payment Complete</h2>
            <p style="color: #666;">Hi ${order.customerInfo.name},</p>
            <p style="color: #666;">Your order has been marked as fully paid.</p>
            
            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #9333ea; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
              <p><strong>Total Amount:</strong> ₹${order.total.toLocaleString()}</p>
            </div>

            <div style="background: #d1fae5; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="color: #065f46; margin: 0; font-size: 18px;">
                ✅ <strong>Payment Complete!</strong> Your order is fully paid.
              </p>
            </div>

            <p style="color: #666;">Thank you for your business!</p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0;">© 2025 animedropzone. All rights reserved.</p>
          </div>
        </div>
      `;

      await sendEmail(
        order.customerInfo.email,
        `Order Fully Paid - ${order.trackingId}`,
        emailHtml
      );

      await sendWhatsApp(order.customerInfo.phone, `✅ *ORDER FULLY PAID*\n\nOrder #${order.trackingId}\nTotal: ₹${order.total.toLocaleString()}\n\nYour order payment is complete. Thank you!`);

      return c.json({ success: true, message: 'Order marked as paid', order: updatedOrder });
    } else {
      return c.json({ success: true, message: 'Order is already paid', order });
    }
  } catch (error) {
    console.log('Error marking order as paid:', error);
    return c.json({ success: false, message: String(error) }, 500);
  }
}
