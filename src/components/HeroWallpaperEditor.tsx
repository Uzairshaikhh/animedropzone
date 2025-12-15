import { useState, useEffect } from "react";
import { Edit2, Save, X, Upload } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { motion, AnimatePresence } from "motion/react";

interface Wallpaper {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
}

export function HeroWallpaperEditor() {
  const [currentWallpaper, setCurrentWallpaper] = useState<Wallpaper | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCurrentWallpaper();
  }, []);

  const fetchCurrentWallpaper = async () => {
    try {
      console.log("🔵 Fetching current wallpaper...");
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📋 All wallpapers data:", data);
        const wallpapers = (data.wallpapers || [])
          .filter((w: Wallpaper | null) => w !== null && w !== undefined)
          .sort((a: Wallpaper, b: Wallpaper) => (a.order || 0) - (b.order || 0));

        console.log("📋 Filtered and sorted wallpapers:", wallpapers);

        if (wallpapers.length > 0) {
          const current = wallpapers[0];
          console.log("✅ Current wallpaper selected:", current);
          setCurrentWallpaper(current);
          setEditData({
            title: current.title,
            subtitle: current.subtitle,
            imageUrl: current.imageUrl,
          });
          setImagePreview(current.imageUrl);
        } else {
          console.warn("⚠️ No wallpapers found!");
        }
      } else {
        const errorText = await response.text();
        console.error("❌ Failed to fetch wallpapers. Status:", response.status, "Error:", errorText);
      }
    } catch (error) {
      console.error("❌ Error fetching current wallpaper:", error);
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
      console.log("📸 Uploading image:", selectedImage.name);
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

      console.log("📡 Upload response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Image uploaded successfully:", data.imageUrl);
        setEditData({ ...editData, imageUrl: data.imageUrl });
        return data.imageUrl;
      } else {
        const errorText = await response.text();
        console.error("❌ Failed to upload image. Status:", response.status, "Error:", errorText);
        alert(`Image upload failed: Status ${response.status} - ${errorText || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      alert(`Error uploading image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setUploadingImage(false);
    }
    return null;
  };

  const handleSave = async () => {
    if (!currentWallpaper) {
      alert("No wallpaper selected. Please load the page again.");
      return;
    }

    if (!currentWallpaper.id) {
      console.error("❌ Wallpaper ID is missing:", currentWallpaper);
      alert("Error: Wallpaper ID is missing. Please refresh the page.");
      return;
    }

    setIsSaving(true);
    try {
      // Upload image if a new one was selected
      let imageUrl = editData.imageUrl;
      if (selectedImage) {
        const newUrl = await uploadImage();
        if (newUrl) {
          imageUrl = newUrl;
        }
      }

      console.log("💾 Saving wallpaper with data:", {
        id: currentWallpaper.id,
        type: typeof currentWallpaper.id,
        title: editData.title,
        subtitle: editData.subtitle,
        imageUrl: imageUrl,
      });

      // Check if this is a default wallpaper
      const isDefault = currentWallpaper.id.startsWith("default_wallpaper_");
      console.log("🔍 Is default wallpaper:", isDefault);

      // For default wallpapers, save locally only
      if (isDefault) {
        console.log("📌 Saving default wallpaper locally only");

        // Update current wallpaper state
        const updatedWallpaper = {
          ...currentWallpaper,
          title: editData.title,
          subtitle: editData.subtitle,
          imageUrl: imageUrl,
        };
        setCurrentWallpaper(updatedWallpaper);

        // Update in localStorage cache
        try {
          const cached = localStorage.getItem("cached_wallpapers");
          if (cached) {
            const cachedWallpapers = JSON.parse(cached);
            const updated = cachedWallpapers.map((w: Wallpaper) =>
              w.id === currentWallpaper.id ? updatedWallpaper : w
            );
            localStorage.setItem("cached_wallpapers", JSON.stringify(updated));
            console.log("💾 Updated wallpaper in localStorage cache:", updated);
          }
        } catch (error) {
          console.error("❌ Error updating localStorage:", error);
        }

        // Broadcast update to other components with the updated wallpapers
        try {
          const channel = new BroadcastChannel("wallpapers");
          const cached = localStorage.getItem("cached_wallpapers");
          const wallpapers = cached ? JSON.parse(cached) : [];
          channel.postMessage({
            type: "wallpaper_updated",
            wallpapers: wallpapers,
            id: currentWallpaper.id,
            timestamp: Date.now(),
          });
          setTimeout(() => channel.close(), 100);
        } catch (error) {
          console.log("BroadcastChannel not available");
        }

        setIsEditing(false);
        setSelectedImage(null);
        setSuccessMessage("✅ Hero wallpaper updated locally!");
        setTimeout(() => setSuccessMessage(""), 3000);
        return;
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/wallpapers/${currentWallpaper.id}`;
      console.log("📍 Update URL:", url);

      // Update the wallpaper
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editData.title,
          subtitle: editData.subtitle,
          imageUrl: imageUrl,
        }),
      });

      console.log("📡 Update response status:", response.status);

      if (response.ok) {
        console.log("✅ Wallpaper updated successfully!");
        setCurrentWallpaper({
          ...currentWallpaper,
          title: editData.title,
          subtitle: editData.subtitle,
          imageUrl: imageUrl,
        });

        // Broadcast update to other components
        try {
          const channel = new BroadcastChannel("wallpapers");
          channel.postMessage({
            type: "wallpaper_updated",
            id: currentWallpaper.id,
            timestamp: Date.now(),
          });
          channel.close();
        } catch (error) {
          console.log("BroadcastChannel not available");
        }

        setIsEditing(false);
        setSelectedImage(null);
        setSuccessMessage("✅ Hero wallpaper updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const errorText = await response.text();
        console.error("❌ Failed to update wallpaper. Status:", response.status, "Error:", errorText);
        alert(`Error: Status ${response.status} - ${errorText || "Failed to update wallpaper"}`);
      }
    } catch (error) {
      console.error("❌ Error saving wallpaper:", error);
      alert(`Error saving wallpaper: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit2 className="w-6 h-6 text-purple-400" />
            Dynamic Hero Wallpaper Editor
          </h2>
          <p className="text-gray-400 text-sm mt-1">Edit the currently displayed hero wallpaper with live preview</p>
        </div>
        {currentWallpaper && (
          <button
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                setSelectedImage(null);
                setImagePreview(currentWallpaper.imageUrl);
                setEditData({
                  title: currentWallpaper.title,
                  subtitle: currentWallpaper.subtitle,
                  imageUrl: currentWallpaper.imageUrl,
                });
              } else {
                setIsEditing(true);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white transition-all"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {successMessage && (
        <motion.div
          className="bg-green-900/30 border border-green-500/50 text-green-300 p-4 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {successMessage}
        </motion.div>
      )}

      {currentWallpaper ? (
        <motion.div
          className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 space-y-4"
          layout
        >
          {/* Live Preview */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Live Preview</h3>
            <div className="relative overflow-hidden rounded-lg h-64 bg-gray-800 border border-purple-500/30">
              <img
                src={imagePreview || currentWallpaper.imageUrl}
                alt="Hero Wallpaper Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3C/svg%3E";
                }}
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/30 flex items-end justify-start p-4">
                  <div className="text-white">
                    <h4 className="text-xl font-bold">{editData.title || currentWallpaper.title}</h4>
                    <p className="text-sm text-gray-300">{editData.subtitle || currentWallpaper.subtitle}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isEditing && (
              <motion.div
                className="space-y-4 pt-4 border-t border-gray-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter hero title"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={editData.subtitle}
                    onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                    className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter hero subtitle"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="hero-image-upload"
                    />
                    <label
                      htmlFor="hero-image-upload"
                      className="flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 px-4 py-3 rounded-lg cursor-pointer transition-all"
                    >
                      <Upload className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300">{selectedImage ? selectedImage.name : "Choose Image"}</span>
                    </label>
                    <input
                      type="url"
                      value={editData.imageUrl}
                      onChange={(e) => {
                        setEditData({ ...editData, imageUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      placeholder="Or paste image URL"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || uploadingImage}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving || uploadingImage ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Info (when not editing) */}
          {!isEditing && (
            <motion.div className="text-gray-300 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p>
                <span className="text-purple-400 font-medium">Title:</span> {currentWallpaper.title}
              </p>
              <p>
                <span className="text-purple-400 font-medium">Subtitle:</span> {currentWallpaper.subtitle}
              </p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <div className="text-center py-12 bg-gray-900 border border-gray-700 rounded-xl">
          <p className="text-gray-400">No wallpaper found. Add one in the Wallpaper Management section.</p>
        </div>
      )}
    </div>
  );
}
