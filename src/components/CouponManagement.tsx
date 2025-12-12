import { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number | null;
  expiryDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

interface CouponManagementProps {
  coupons: Coupon[];
  onRefresh: () => void;
}

export function CouponManagement({ coupons, onRefresh }: CouponManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    expiryDate: '',
    usageLimit: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCoupon
        ? `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/coupons/${editingCoupon.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/coupons`;
      
      const response = await fetch(url, {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: '',
          minPurchase: '',
          maxDiscount: '',
          expiryDate: '',
          usageLimit: '',
          isActive: true,
        });
        setEditingCoupon(null);
        setShowForm(false);
        onRefresh();
      } else {
        alert(data.error || 'Failed to save coupon');
      }
    } catch (error) {
      console.log('Error saving coupon:', error);
      alert('Failed to save coupon. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/coupons/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        onRefresh();
      }
    } catch (error) {
      console.log('Error deleting coupon:', error);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 16) : '',
      usageLimit: coupon.usageLimit?.toString() || '',
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white mb-2">Coupon Management</h1>
          <p className="text-gray-400">Create and manage discount coupons for your store</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCoupon(null);
              setFormData({
                code: '',
                discountType: 'percentage',
                discountValue: '',
                minPurchase: '',
                maxDiscount: '',
                expiryDate: '',
                usageLimit: '',
                isActive: true,
              });
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Coupon
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-8">
          <h2 className="text-white mb-6">
            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-gray-300 mb-2">Coupon Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                placeholder="e.g., SAVE20, ANIME50"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">Enter a unique code that customers will use</p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Discount Type *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">
                  Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  required
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  step="0.01"
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Minimum Purchase (₹)</label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="0 (No minimum)"
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {formData.discountType === 'percentage' && (
              <div>
                <label className="block text-gray-300 mb-2">Maximum Discount Amount (₹)</label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="Leave empty for no limit"
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">Cap the maximum discount for percentage-based coupons</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Expiry Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty for no expiry</p>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  min="0"
                  placeholder="Unlimited"
                  className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">Max number of times code can be used</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 bg-purple-900/20 border border-purple-500/30 rounded"
              />
              <label htmlFor="isActive" className="text-gray-300">
                Active (Customers can use this coupon)
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg transition-all"
              >
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCoupon(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.length === 0 ? (
            <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-12 text-center">
              <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No coupons yet. Create your first discount coupon!</p>
            </div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-6"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {coupon.discountType === 'percentage' ? (
                      <Percent className="w-8 h-8" />
                    ) : (
                      <Tag className="w-8 h-8" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white text-xl font-mono">{coupon.code}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        coupon.isActive ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-purple-400 mb-3">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% OFF` 
                        : `₹${coupon.discountValue} OFF`
                      }
                      {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                        <span className="text-gray-400 text-sm ml-2">(Max ₹{coupon.maxDiscount})</span>
                      )}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Min Purchase</p>
                        <p className="text-gray-300">₹{coupon.minPurchase.toLocaleString()}</p>
                      </div>
                      
                      {coupon.expiryDate && (
                        <div>
                          <p className="text-gray-500 mb-1">Expires On</p>
                          <p className="text-gray-300">{new Date(coupon.expiryDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-gray-500 mb-1">Usage</p>
                        <p className="text-gray-300">
                          {coupon.usageCount} / {coupon.usageLimit || '∞'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500 mb-1">Created</p>
                        <p className="text-gray-300">{new Date(coupon.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
