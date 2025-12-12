import { X } from 'lucide-react';

interface Subcategory {
  name: string;
  value: string;
  description: string;
}

interface SubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  subcategories: Subcategory[];
  onSelectSubcategory: (subcategory: string) => void;
}

export function SubcategoryModal({
  isOpen,
  onClose,
  category,
  subcategories,
  onSelectSubcategory,
}: SubcategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-900/50 m-4">
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <h2 className="text-white capitalize">{category} Categories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subcategories.map((subcategory) => (
              <button
                key={subcategory.value}
                onClick={() => {
                  onSelectSubcategory(subcategory.value);
                  onClose();
                }}
                className="group bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 hover:border-purple-500 rounded-xl p-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-900/50 text-left"
              >
                <h4 className="text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {subcategory.name}
                </h4>
                <p className="text-gray-400 text-sm">{subcategory.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
