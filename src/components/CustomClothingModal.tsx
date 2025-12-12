import { X, Upload, Shirt, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

interface CustomClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomClothingModal({ isOpen, onClose, onSuccess }: CustomClothingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    clothingType: 'tshirt',
    size: 'M',
    color: '',
    quantity: '1',
    instructions: '',
    address: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setSelectedImages([...selectedImages, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedImages.length === 0) {
      alert('Please upload at least one design image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Supabase Storage via server
      const uploadedUrls: string[] = [];
      
      for (const image of selectedImages) {
        const formDataObj = new FormData();
        formDataObj.append('file', image);
        formDataObj.append('folder', 'custom-designs');
        
        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/upload-image`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: formDataObj,
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error('Error uploading image:', errorData);
          throw new Error(errorData.error || 'Failed to upload images');
        }

        const uploadData = await uploadResponse.json();
        uploadedUrls.push(uploadData.imageUrl);
      }

      // Submit custom order
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/custom-clothing`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            quantity: parseInt(formData.quantity),
            designImages: uploadedUrls,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        alert(`Custom clothing request submitted successfully! Request ID: ${data.requestId}\nWe'll contact you within 24-48 hours with a quote.`);
        setFormData({
          name: '',
          email: '',
          phone: '',
          clothingType: 'tshirt',
          size: 'M',
          color: '',
          quantity: '1',
          instructions: '',
          address: '',
        });
        setSelectedImages([]);
        setImagePreviews([]);
        onSuccess();
        onClose();
      } else {
        alert(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting custom order:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-black to-purple-900/40 border border-purple-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Shirt className="w-6 h-6" />
            <h2 className="text-white">Custom Clothing Design</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h3 className="text-white mb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              How It Works
            </h3>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Upload your design images (max 5 images)</li>
              <li>Fill in your details and preferences</li>
              <li>Our team will review and contact you with a quote within 24-48 hours</li>
              <li>Once approved, we'll create your custom clothing</li>
            </ul>
          </div>

          {/* Design Upload */}
          <div>
            <label className="block text-gray-300 mb-3">
              Upload Design Images * (Max 5)
            </label>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Design ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-purple-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {selectedImages.length < 5 && (
              <label className="w-full bg-purple-900/20 border-2 border-dashed border-purple-500/30 rounded-lg p-8 cursor-pointer hover:bg-purple-900/30 transition-colors flex flex-col items-center justify-center gap-3">
                <Upload className="w-12 h-12 text-purple-400" />
                <div className="text-center">
                  <p className="text-gray-300 mb-1">Click to upload design images</p>
                  <p className="text-gray-500 text-sm">PNG, JPG up to 5MB each</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {selectedImages.length} of 5 images uploaded
            </p>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="+91 XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Clothing Type *</label>
              <select
                value={formData.clothingType}
                onChange={(e) => setFormData({ ...formData, clothingType: e.target.value })}
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="tshirt">T-Shirt</option>
                <option value="hoodie">Hoodie</option>
                <option value="sweatshirt">Sweatshirt</option>
                <option value="jacket">Jacket</option>
                <option value="tank">Tank Top</option>
                <option value="longsleeve">Long Sleeve</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Size *</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">3XL</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Preferred Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g., Black, White, Purple"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="1"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-gray-300 mb-2">Special Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Any specific requirements, placement details, or special requests..."
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-gray-300 mb-2">Delivery Address *</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              rows={3}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter complete delivery address..."
            />
          </div>

          {/* Pricing Info */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 mb-2">Pricing Information</h4>
            <p className="text-gray-300 text-sm">
              Custom clothing prices vary based on design complexity, quantity, and clothing type. 
              Our team will provide you with a detailed quote within 24-48 hours after reviewing your design.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || selectedImages.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 py-4 rounded-lg transition-all text-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Shirt className="w-5 h-5" />
                Submit Custom Design Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}