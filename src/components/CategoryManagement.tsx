import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, FolderOpen, Download } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  order: number;
  createdAt: string;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subcategories: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/categories`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    const subcategoriesArray = formData.subcategories
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const categoryData = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
      subcategories: subcategoriesArray,
    };

    try {
      const url = editingCategory
        ? `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/categories/${editingCategory.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ name: '', slug: '', subcategories: '' });
        setEditingCategory(null);
        setShowForm(false);
        loadCategories();
        alert(editingCategory ? 'Category updated!' : 'Category added!');
      } else {
        alert('Failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      subcategories: category.subcategories.join(', '),
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This may affect existing products.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/categories/${categoryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        loadCategories();
        alert('Category deleted successfully!');
      } else {
        alert('Failed to delete: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (category: Category, subcategoryIndex: number) => {
    if (!confirm(`Are you sure you want to delete the subcategory "${category.subcategories[subcategoryIndex]}"?`)) {
      return;
    }

    try {
      const updatedSubcategories = category.subcategories.filter((_, index) => index !== subcategoryIndex);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/categories/${category.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: category.name,
            slug: category.slug,
            subcategories: updatedSubcategories,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        loadCategories();
        alert('Subcategory removed successfully!');
      } else {
        alert('Failed to remove subcategory: ' + data.error);
      }
    } catch (error) {
      console.error('Error removing subcategory:', error);
      alert('Failed to remove subcategory');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '', subcategories: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6" />
            Category Management
          </h2>
          <p className="text-gray-400 mt-1">
            Manage product categories and subcategories
          </p>
        </div>
        <div className="flex gap-3">
          {!showForm && categories.length > 0 && (
            <button
              onClick={async () => {
                if (!confirm(`Are you sure you want to delete all ${categories.length} categories and their subcategories? This may affect existing products and cannot be undone.`)) {
                  return;
                }
                
                try {
                  // Delete all categories
                  await Promise.all(
                    categories.map(category => 
                      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/categories/${category.id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${publicAnonKey}`,
                        },
                      })
                    )
                  );
                  
                  await loadCategories();
                  alert('All categories deleted successfully!');
                } catch (error) {
                  console.error('Error deleting categories:', error);
                  alert('Failed to delete all categories');
                }
              }}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </button>
          )}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-2xl p-8">
          <h3 className="text-white mb-6">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-gray-300 mb-2">
                Category Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Anime Figures, Manga, Katana"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Category Slug (Optional)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., anime-figures (auto-generated if empty)"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-gray-500 text-sm mt-1">
                URL-friendly identifier. Auto-generated from name if left empty.
              </p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                Subcategories (Optional)
              </label>
              <textarea
                value={formData.subcategories}
                onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                rows={4}
                placeholder="Enter subcategories separated by commas&#10;e.g., Demon Slayer, Naruto, One Piece, Attack on Titan"
                className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-gray-500 text-sm mt-1">
                Separate multiple subcategories with commas. Leave empty if no subcategories.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">
              No categories yet. Add your first category!
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-white mb-2">{category.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Slug: <span className="text-purple-400">{category.slug}</span>
                  </p>
                  
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Subcategories:</p>
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((sub, index) => (
                          <span
                            key={index}
                            className="bg-purple-900/30 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {sub}
                            <button
                              onClick={() => handleDeleteSubcategory(category, index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove subcategory"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No subcategories</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Created: {new Date(category.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}