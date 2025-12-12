import { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingDown, Bell } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { motion } from 'motion/react';

interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  category: string;
  image: string;
  severity: 'critical' | 'warning' | 'normal';
}

export function InventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    criticalThreshold: 5,
    warningThreshold: 10,
    emailNotifications: true,
  });

  useEffect(() => {
    fetchAlerts();
    fetchSettings();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/inventory-alerts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/inventory-settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/inventory-settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );
      const data = await response.json();
      if (data.success) {
        alert('Settings updated successfully!');
        fetchAlerts(); // Refresh alerts with new thresholds
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/20';
      default:
        return 'border-purple-500 bg-purple-900/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <TrendingDown className="w-5 h-5 text-yellow-500" />;
      default:
        return <Package className="w-5 h-5 text-purple-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white mb-2">Inventory Alerts</h1>
        <p className="text-gray-400">Monitor low stock products and set restock reminders</p>
      </div>

      {/* Alert Settings */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alert Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 mb-2">Critical Threshold</label>
            <input
              type="number"
              value={settings.criticalThreshold}
              onChange={(e) => setSettings({ ...settings, criticalThreshold: parseInt(e.target.value) })}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              min="1"
            />
            <p className="text-gray-500 text-sm mt-1">Alert when stock ≤ this value</p>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Warning Threshold</label>
            <input
              type="number"
              value={settings.warningThreshold}
              onChange={(e) => setSettings({ ...settings, warningThreshold: parseInt(e.target.value) })}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              min="1"
            />
            <p className="text-gray-500 text-sm mt-1">Warning when stock ≤ this value</p>
          </div>
          <div className="flex items-end">
            <button
              onClick={updateSettings}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-white">Critical</h3>
          </div>
          <p className="text-3xl text-white">{criticalAlerts.length}</p>
          <p className="text-gray-400 text-sm">Products out of stock or very low</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-6 h-6 text-yellow-500" />
            <h3 className="text-white">Warning</h3>
          </div>
          <p className="text-3xl text-white">{warningAlerts.length}</p>
          <p className="text-gray-400 text-sm">Products running low</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-purple-500" />
            <h3 className="text-white">Total Alerts</h3>
          </div>
          <p className="text-3xl text-white">{alerts.length}</p>
          <p className="text-gray-400 text-sm">Active inventory alerts</p>
        </div>
      </div>

      {/* Alert List */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-6">Low Stock Products</h2>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">All products are well stocked! 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-xl p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={alert.image} 
                    alt={alert.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getSeverityIcon(alert.severity)}
                      <h3 className="text-white">{alert.productName}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{alert.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-2xl mb-1">{alert.currentStock}</p>
                    <p className="text-gray-400 text-sm">units left</p>
                  </div>
                  <div className="ml-4">
                    {alert.severity === 'critical' && (
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                        Restock Now
                      </span>
                    )}
                    {alert.severity === 'warning' && (
                      <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">
                        Low Stock
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const criticalProducts = criticalAlerts.map(a => a.productName).join(', ');
              navigator.clipboard.writeText(criticalProducts);
              alert('Critical products copied to clipboard!');
            }}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            disabled={criticalAlerts.length === 0}
          >
            Copy Critical Products
          </button>
          <button
            onClick={() => {
              const report = alerts.map(a => 
                `${a.productName}: ${a.currentStock} units (${a.severity})`
              ).join('\n');
              navigator.clipboard.writeText(report);
              alert('Full report copied to clipboard!');
            }}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            disabled={alerts.length === 0}
          >
            Export Alert Report
          </button>
        </div>
      </div>
    </div>
  );
}
