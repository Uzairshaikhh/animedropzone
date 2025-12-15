import { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, Edit2, Upload, X, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { motion } from "motion/react";

interface Wallpaper {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
}

export function WallpaperManagement() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [currentWallpaper, setCurrentWallpaper] = useState<Wallpaper | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWallpaper, setEditingWallpaper] = useState<Wallpaper | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    subtitle: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchWallpapers();
    // Load default wallpapers immediately as fallback
    setWallpapers(getDefaultWallpapers());
  }, []);

  useEffect(() => {
    // Set current wallpaper to the first one (order 0)
    if (wallpapers.length > 0) {
      const current = wallpapers.find((w) => w.order === 0) || wallpapers[0];
      setCurrentWallpaper(current);
    }
  }, [wallpapers]);

  // Sync wallpapers to localStorage whenever they change
  useEffect(() => {
    if (wallpapers.length > 0) {
      try {
        localStorage.setItem("cached_wallpapers", JSON.stringify(wallpapers));
        console.log("💾 Wallpapers saved to localStorage");
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [wallpapers]);

  const getDefaultWallpapers = (): Wallpaper[] => [
    {
      id: `default_wallpaper_1`,
      imageUrl:
        "https://images.unsplash.com/photo-1668293750324-bd77c1f08ca9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW1vbiUyMHNsYXllciUyMGFuaW1lfGVufDF8fHx8MTc2NTMwODI3OHww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Demon Slayer Collection",
      subtitle: "Limited Edition Figures & Katanas",
      order: 0,
    },
    {
      id: `default_wallpaper_2`,
      imageUrl:
        "https://images.unsplash.com/photo-1740644545217-892da8cce224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXJ1dG8lMjBhbmltZSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NjUzMDgyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Naruto Legends",
      subtitle: "Iconic Ninja Collection",
      order: 1,
    },
    {
      id: `default_wallpaper_3`,
      imageUrl:
        "https://images.unsplash.com/photo-1667419674822-1a9195436f1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmUlMjBwaWVjZSUyMGFuaW1lfGVufDF8fHx8MTc2NTMwODI3OXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "One Piece Adventure",
      subtitle: "Grand Line Treasures",
      order: 2,
    },
    {
      id: `default_wallpaper_4`,
      imageUrl:
        "https://images.unsplash.com/photo-1709675577960-0b1e7ba55347?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdHRhY2slMjB0aXRhbiUyMGFuaW1lfGVufDF8fHx8MTc2NTMwODI3OXww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Attack on Titan",
      subtitle: "Survey Corps Collection",
      order: 3,
    },
    {
      id: `default_wallpaper_5`,
      imageUrl:
        "https://images.unsplash.com/photo-1575540325855-4b5d285a3845?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFnb24lMjBiYWxsJTIwYW5pbWV8ZW58MXx8fHwxNzY1MjE3NDA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Dragon Ball Z",
      subtitle: "Super Saiyan Warriors",
      order: 4,
    },
  ];

  const isDefaultWallpaper = (id: string): boolean => {
    return id.startsWith("default_wallpaper_");
  };

  const seedDefaultWallpapers = async () => {
    try {
      console.log("🌱 Seeding default wallpapers to database...");
      const defaults = getDefaultWallpapers();

      for (const wallpaper of defaults) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                imageUrl: wallpaper.imageUrl,
                title: wallpaper.title,
                subtitle: wallpaper.subtitle,
              }),
            }
          );

          if (response.ok) {
            console.log(`✅ Seeded wallpaper: ${wallpaper.title}`);
          } else {
            const error = await response.text();
            console.error(`❌ Failed to seed wallpaper: ${wallpaper.title}`, error);
          }
        } catch (itemError) {
          console.error(`❌ Error seeding ${wallpaper.title}:`, itemError);
        }
      }

      // Fetch again after seeding with a delay
      console.log("🔄 Re-fetching wallpapers after seeding...");
      setTimeout(() => {
        fetchWallpapers();
      }, 1000);
    } catch (error) {
      console.error("❌ Error seeding wallpapers:", error);
    }
  };

  const fetchWallpapers = async () => {
    try {
      console.log("🔵 Fetching wallpapers...");
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      console.log("📡 Wallpaper fetch response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Wallpaper data received:", data);

        // Filter out any null/undefined wallpapers
        const validWallpapers = (data.wallpapers || [])
          .filter((w: Wallpaper | null) => w !== null && w !== undefined)
          .sort((a: Wallpaper, b: Wallpaper) => (a.order || 0) - (b.order || 0));

        console.log("✅ Valid wallpapers count:", validWallpapers.length);
        console.log("✅ Wallpapers:", validWallpapers);

        if (validWallpapers.length > 0) {
          setWallpapers(validWallpapers);
        } else {
          console.log("⚠️ No wallpapers found, seeding defaults...");
          await seedDefaultWallpapers();
        }
      } else {
        const errorText = await response.text();
        console.error("❌ Failed to fetch wallpapers:", response.status, errorText);
        console.log("📍 Trying to load from cache...");
        // Try to load from localStorage
        try {
          const cached = localStorage.getItem("cached_wallpapers");
          if (cached) {
            const cachedWallpapers = JSON.parse(cached);
            console.log("✅ Loaded wallpapers from cache:", cachedWallpapers);
            setWallpapers(cachedWallpapers);
            return;
          }
        } catch (cacheError) {
          console.error("Error loading from cache:", cacheError);
        }
        console.log("📍 Using default wallpapers");
        setWallpapers(getDefaultWallpapers());
      }
    } catch (error) {
      console.error("❌ Error fetching wallpapers:", error);
      console.log("📍 Trying to load from cache...");
      // Try to load from localStorage
      try {
        const cached = localStorage.getItem("cached_wallpapers");
        if (cached) {
          const cachedWallpapers = JSON.parse(cached);
          console.log("✅ Loaded wallpapers from cache:", cachedWallpapers);
          setWallpapers(cachedWallpapers);
          return;
        }
      } catch (cacheError) {
        console.error("Error loading from cache:", cacheError);
      }
      console.log("📍 Using default wallpapers");
      setWallpapers(getDefaultWallpapers());
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    setUploadingImage(true);
    const formDataObj = new FormData();
    formDataObj.append("file", selectedImage);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/upload-wallpaper`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formDataObj,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        const errorData = await response.json();
        const errorMsg = errorData.error || "Failed to upload image";

        // Check for RLS error
        if (errorMsg.includes("row-level security") || errorMsg.includes("RLS")) {
          alert(
            '⚠️ Storage RLS Error detected!\n\nPlease go to the Admin Panel and look for the "Fix Storage" button, or manually configure RLS policies in your Supabase dashboard.'
          );
        } else {
          alert(`Failed to upload image: ${errorMsg}`);
        }
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;

      console.log("🔵 WALLPAPER SUBMIT - Starting...");
      console.log("📝 Form Data:", formData);
      console.log("🖼️ Selected Image:", selectedImage?.name);

      // Upload image if a new one was selected
      if (selectedImage) {
        console.log("📤 Uploading image...");
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          console.error("❌ Image upload failed");
          setIsLoading(false);
          return;
        }
        console.log("✅ Image uploaded:", uploadedUrl);
        imageUrl = uploadedUrl;
      }

      // Validate that we have an image URL
      if (!imageUrl || imageUrl.trim() === "") {
        alert("Please provide an image URL or upload an image");
        setIsLoading(false);
        return;
      }

      const wallpaperData = {
        imageUrl,
        title: formData.title,
        subtitle: formData.subtitle,
      };

      console.log("📦 Wallpaper data to send:", wallpaperData);

      // Skip API call for default wallpapers - save locally only
      if (editingWallpaper && isDefaultWallpaper(editingWallpaper.id)) {
        console.log("📌 Editing default wallpaper - saving locally only");

        // Create updated wallpapers array
        const updatedWallpapers = wallpapers.map((w) =>
          w.id === editingWallpaper.id
            ? {
                ...w,
                title: formData.title,
                subtitle: formData.subtitle,
                imageUrl: imageUrl,
              }
            : w
        );

        // Update in local state
        setWallpapers(updatedWallpapers);

        // Cache updated wallpapers IMMEDIATELY (not using old state)
        localStorage.setItem("cached_wallpapers", JSON.stringify(updatedWallpapers));
        console.log("💾 Cached updated wallpapers:", updatedWallpapers);

        // Broadcast update
        try {
          const channel = new BroadcastChannel("wallpapers");
          channel.postMessage({
            type: "wallpaper_updated",
            wallpapers: updatedWallpapers,
            timestamp: Date.now(),
          });
          setTimeout(() => {
            channel.postMessage({
              type: "wallpaper_updated",
              wallpapers: updatedWallpapers,
              timestamp: Date.now(),
            });
            channel.close();
          }, 100);
        } catch (error) {
          console.log("BroadcastChannel not available");
        }

        setShowForm(false);
        setEditingWallpaper(null);
        setFormData({ imageUrl: "", title: "", subtitle: "" });
        setSelectedImage(null);
        setImagePreview("");
        alert("Default wallpaper updated locally ✅");
        return;
      }

      const url = editingWallpaper
        ? `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers/${editingWallpaper.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers`;

      const method = editingWallpaper ? "PUT" : "POST";

      console.log(`📡 Sending ${method} request to:`, url);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wallpaperData),
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Wallpaper saved successfully:", result);

        alert("Wallpaper saved successfully! ✅");

        // Broadcast wallpaper update to other components (multiple times for reliability)
        try {
          const channel = new BroadcastChannel("wallpapers");
          channel.postMessage({
            type: editingWallpaper ? "wallpaper_updated" : "wallpaper_added",
            timestamp: Date.now(),
          });
          // Send message twice with small delay for reliability
          setTimeout(() => {
            channel.postMessage({
              type: editingWallpaper ? "wallpaper_updated" : "wallpaper_added",
              timestamp: Date.now(),
            });
            channel.close();
          }, 100);
        } catch (error) {
          console.log("BroadcastChannel not available");
        }

        // Add wallpaper to local state immediately as fallback
        if (!editingWallpaper) {
          console.log("💾 Adding wallpaper to local state...");
          const newWallpaper: Wallpaper = {
            id: `wallpaper_${Date.now()}`,
            imageUrl: imageUrl,
            title: formData.title,
            subtitle: formData.subtitle,
            order: wallpapers.length,
          };
          setWallpapers([...wallpapers, newWallpaper]);
          console.log("✅ Wallpaper added to local state:", newWallpaper);
        } else {
          console.log("💾 Updating wallpaper in local state...");
          setWallpapers(
            wallpapers.map((w) =>
              w.id === editingWallpaper.id
                ? {
                    ...w,
                    title: formData.title,
                    subtitle: formData.subtitle,
                    imageUrl: imageUrl,
                  }
                : w
            )
          );
        }

        await fetchWallpapers();
        setShowForm(false);
        setEditingWallpaper(null);
        setFormData({ imageUrl: "", title: "", subtitle: "" });
        setSelectedImage(null);
        setImagePreview("");
      } else {
        const errorText = await response.text();
        console.error("❌ Failed to save wallpaper. Status:", response.status, "Error:", errorText);

        // Still add to local state as fallback even if API fails
        console.log("💾 Adding to local state as fallback...");
        if (!editingWallpaper) {
          const newWallpaper: Wallpaper = {
            id: `wallpaper_${Date.now()}`,
            imageUrl: imageUrl,
            title: formData.title,
            subtitle: formData.subtitle,
            order: wallpapers.length,
          };
          setWallpapers([...wallpapers, newWallpaper]);
          setShowForm(false);
          setFormData({ imageUrl: "", title: "", subtitle: "" });
          setSelectedImage(null);
          setImagePreview("");
          alert("Wallpaper saved locally (API sync failed, but your wallpaper is saved)");
        } else {
          // Also save edits locally when API fails
          console.log("💾 Updating wallpaper in local state (API failed)...");
          setWallpapers(
            wallpapers.map((w) =>
              w.id === editingWallpaper.id
                ? {
                    ...w,
                    title: formData.title,
                    subtitle: formData.subtitle,
                    imageUrl: imageUrl,
                  }
                : w
            )
          );
          setShowForm(false);
          setEditingWallpaper(null);
          setFormData({ imageUrl: "", title: "", subtitle: "" });
          setSelectedImage(null);
          setImagePreview("");
          alert("Wallpaper updated locally (API sync failed, but changes are saved)");
        }
      }
    } catch (error) {
      console.error("❌ Error saving wallpaper:", error);

      // Try to save locally on any error
      if (!editingWallpaper) {
        const newWallpaper: Wallpaper = {
          id: `wallpaper_${Date.now()}`,
          imageUrl: formData.imageUrl,
          title: formData.title,
          subtitle: formData.subtitle,
          order: wallpapers.length,
        };
        setWallpapers([...wallpapers, newWallpaper]);
        setShowForm(false);
        setFormData({ imageUrl: "", title: "", subtitle: "" });
        setSelectedImage(null);
        setImagePreview("");
        alert("Wallpaper saved locally (network error, but your wallpaper is saved)");
      } else {
        setWallpapers(
          wallpapers.map((w) =>
            w.id === editingWallpaper.id
              ? {
                  ...w,
                  title: formData.title,
                  subtitle: formData.subtitle,
                  imageUrl: formData.imageUrl,
                }
              : w
          )
        );
        setShowForm(false);
        setEditingWallpaper(null);
        setFormData({ imageUrl: "", title: "", subtitle: "" });
        setSelectedImage(null);
        setImagePreview("");
        alert("Wallpaper updated locally (network error, but changes are saved)");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (wallpaper: Wallpaper) => {
    setEditingWallpaper(wallpaper);
    setFormData({
      imageUrl: wallpaper.imageUrl,
      title: wallpaper.title,
      subtitle: wallpaper.subtitle,
    });
    setImagePreview(wallpaper.imageUrl);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wallpaper?")) return;

    try {
      console.log("🗑️ Deleting wallpaper:", id);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log("📡 Delete response status:", response.status);

      if (response.ok) {
        console.log("✅ Wallpaper deleted successfully!");
        // Broadcast wallpaper deletion to other components (multiple times for reliability)
        try {
          const channel = new BroadcastChannel("wallpapers");
          channel.postMessage({
            type: "wallpaper_deleted",
            id,
            timestamp: Date.now(),
          });
          // Send message twice with small delay for reliability
          setTimeout(() => {
            channel.postMessage({
              type: "wallpaper_deleted",
              id,
              timestamp: Date.now(),
            });
            channel.close();
          }, 100);
        } catch (error) {
          console.log("BroadcastChannel not available");
        }

        await fetchWallpapers();
      } else {
        const errorText = await response.text();
        console.error("❌ Failed to delete wallpaper. Status:", response.status, "Error:", errorText);

        // Delete locally as fallback
        console.log("💾 Deleting from local state as fallback...");
        setWallpapers(wallpapers.filter((w) => w.id !== id));
        alert("Wallpaper deleted locally (API sync failed, but it's removed from your list)");
      }
    } catch (error) {
      console.error("Error deleting wallpaper:", error);

      // Delete locally on any error
      console.log("💾 Deleting from local state due to error...");
      setWallpapers(wallpapers.filter((w) => w.id !== id));
      alert("Wallpaper deleted locally (network error, but it's removed from your list)");
    }
  };

  const moveWallpaper = async (id: string, direction: "up" | "down") => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers/${id}/reorder`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ direction }),
        }
      );

      if (response.ok) {
        // Broadcast wallpaper reorder to other components
        try {
          const channel = new BroadcastChannel("wallpapers");
          channel.postMessage({
            type: "wallpaper_reordered",
            id,
            direction,
            timestamp: Date.now(),
          });
          channel.close();
        } catch (error) {
          console.log("BroadcastChannel not available");
        }

        await fetchWallpapers();
      }
    } catch (error) {
      console.error("Error reordering wallpaper:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Wallpaper Section */}
      {currentWallpaper && (
        <motion.div
          className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/50 rounded-xl p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Currently Displayed Wallpaper</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-shrink-0 w-full sm:w-48">
              <img
                src={currentWallpaper.imageUrl}
                alt={currentWallpaper.title}
                className="w-full sm:w-48 h-28 object-cover rounded-lg border border-purple-500/30"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect fill='%23333' width='100' height='60'/%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="flex-1">
              <h4 className="text-white font-semibold text-lg">{currentWallpaper.title}</h4>
              <p className="text-gray-300 text-sm mt-1">{currentWallpaper.subtitle}</p>
              <p className="text-purple-400 text-xs mt-3">ID: {currentWallpaper.id}</p>
            </div>

            <motion.button
              onClick={() => {
                setEditingWallpaper(currentWallpaper);
                setFormData({
                  imageUrl: currentWallpaper.imageUrl,
                  title: currentWallpaper.title,
                  subtitle: currentWallpaper.subtitle,
                });
                setImagePreview(currentWallpaper.imageUrl);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit2 className="w-5 h-5" />
              Edit Current
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-start gap-6">
        <div>
          <h2 className="text-2xl text-white mb-2 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-purple-400" />
            Hero Wallpapers
          </h2>
          <p className="text-gray-400">Manage the sliding hero section wallpapers - Edit, remove, or reorder them</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {wallpapers.length > 0 && (
            <motion.button
              onClick={async () => {
                if (
                  !confirm(
                    `Are you sure you want to delete all ${wallpapers.length} wallpapers? This action cannot be undone.`
                  )
                ) {
                  return;
                }

                try {
                  // Delete all wallpapers
                  await Promise.all(
                    wallpapers.map((wallpaper) =>
                      fetch(
                        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers/${wallpaper.id}`,
                        {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${publicAnonKey}`,
                          },
                        }
                      )
                    )
                  );

                  // Broadcast wallpaper deletion to other components
                  try {
                    const channel = new BroadcastChannel("wallpapers");
                    channel.postMessage({
                      type: "wallpaper_deleted_all",
                      timestamp: Date.now(),
                    });
                    channel.close();
                  } catch (error) {
                    console.log("BroadcastChannel not available");
                  }

                  await fetchWallpapers();
                  alert("All wallpapers deleted successfully!");
                } catch (error) {
                  console.error("Error deleting wallpapers:", error);
                  alert("Failed to delete all wallpapers");
                }
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`Delete all ${wallpapers.length} wallpapers`}
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline">Delete All</span>
              <span className="sm:hidden">Clear</span>
            </motion.button>
          )}
          <motion.button
            onClick={() => {
              setShowForm(true);
              setEditingWallpaper(null);
              setFormData({ imageUrl: "", title: "", subtitle: "" });
              setSelectedImage(null);
              setImagePreview("");
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Add Wallpaper
          </motion.button>
        </div>
      </div>

      {showForm && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl text-white">{editingWallpaper ? "Edit Wallpaper" : "Add New Wallpaper"}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingWallpaper(null);
                  setFormData({ imageUrl: "", title: "", subtitle: "" });
                  setSelectedImage(null);
                  setImagePreview("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-white mb-2">Wallpaper Image</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="wallpaper-image-upload"
                  />
                  <label
                    htmlFor="wallpaper-image-upload"
                    className="flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 px-4 py-3 rounded-lg cursor-pointer transition-all"
                  >
                    <Upload className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300">{selectedImage ? selectedImage.name : "Choose Image"}</span>
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-purple-500/30"
                    />
                  )}
                  <input
                    type="text"
                    placeholder="Or paste image URL"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-black/50 border border-purple-500/30 px-4 py-3 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-white mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 px-4 py-3 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-white mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-black/50 border border-purple-500/30 px-4 py-3 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading || uploadingImage}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg disabled:opacity-50 transition-all"
                >
                  {isLoading || uploadingImage ? "Saving..." : editingWallpaper ? "Update Wallpaper" : "Add Wallpaper"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingWallpaper(null);
                    setFormData({ imageUrl: "", title: "", subtitle: "" });
                    setSelectedImage(null);
                    setImagePreview("");
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Wallpapers List */}
      <div className="grid gap-4">
        {wallpapers.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No wallpapers added yet</p>
            <p className="text-gray-500 text-sm mt-2">Default wallpapers will be shown on the hero section</p>
          </div>
        ) : (
          wallpapers.map((wallpaper, index) => (
            <motion.div
              key={wallpaper.id}
              className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 hover:border-purple-400/50 rounded-xl p-4 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ borderColor: "rgba(192, 132, 250, 0.7)" }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-shrink-0 w-full sm:w-32">
                  <img
                    src={wallpaper.imageUrl}
                    alt={wallpaper.title}
                    className="w-full sm:w-32 h-20 object-cover rounded-lg border border-purple-500/30"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect fill='%23333' width='100' height='60'/%3E%3C/svg%3E";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{wallpaper.title}</h4>
                      <p className="text-gray-400 text-sm truncate">{wallpaper.subtitle}</p>
                      <p className="text-purple-400 text-xs mt-2">
                        Position: <span className="font-semibold">#{wallpaper.order + 1}</span> of {wallpapers.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="flex gap-1 border-r border-gray-600 pr-2">
                    <button
                      onClick={() => moveWallpaper(wallpaper.id, "up")}
                      disabled={index === 0}
                      className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Move up in order"
                    >
                      <ChevronUp className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                      onClick={() => moveWallpaper(wallpaper.id, "down")}
                      disabled={index === wallpapers.length - 1}
                      className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Move down in order"
                    >
                      <ChevronDown className="w-4 h-4 text-purple-400" />
                    </button>
                  </div>

                  <motion.button
                    onClick={() => handleEdit(wallpaper)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 hover:border-blue-400 rounded-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Edit this wallpaper"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">Edit</span>
                  </motion.button>

                  <motion.button
                    onClick={() => handleDelete(wallpaper.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 hover:border-red-400 rounded-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Delete this wallpaper"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">Remove</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
