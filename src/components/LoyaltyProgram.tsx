import { useState, useEffect } from 'react';
import { Award, Star, Gift, TrendingUp, Users, Settings } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { motion } from 'motion/react';

interface LoyaltySettings {
  pointsPerRupee: number;
  signupBonus: number;
  referralBonus: number;
  birthdayBonus: number;
  reviewBonus: number;
  minimumRedemption: number;
  redemptionValue: number; // Points needed for ₹1
}

interface LoyaltyStats {
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeMembers: number;
  topMembers: Array<{
    name: string;
    email: string;
    points: number;
    tier: string;
  }>;
}

interface RewardTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}

export function LoyaltyProgram() {
  const [settings, setSettings] = useState<LoyaltySettings>({
    pointsPerRupee: 1,
    signupBonus: 100,
    referralBonus: 500,
    birthdayBonus: 200,
    reviewBonus: 50,
    minimumRedemption: 500,
    redemptionValue: 10,
  });
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [tiers, setTiers] = useState<RewardTier[]>([
    {
      id: '1',
      name: 'Bronze',
      minPoints: 0,
      benefits: ['Earn 1 point per ₹1 spent', 'Birthday bonus'],
      color: 'from-amber-700 to-amber-900',
    },
    {
      id: '2',
      name: 'Silver',
      minPoints: 1000,
      benefits: ['Earn 1.5 points per ₹1 spent', 'Birthday bonus', 'Early access to sales'],
      color: 'from-gray-400 to-gray-600',
    },
    {
      id: '3',
      name: 'Gold',
      minPoints: 5000,
      benefits: ['Earn 2 points per ₹1 spent', 'Birthday bonus', 'Early access', 'Free shipping'],
      color: 'from-yellow-400 to-yellow-600',
    },
    {
      id: '4',
      name: 'Platinum',
      minPoints: 10000,
      benefits: ['Earn 3 points per ₹1 spent', 'All benefits', 'Exclusive products', 'Priority support'],
      color: 'from-purple-400 to-purple-600',
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/loyalty/settings`,
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
      console.error('Error fetching loyalty settings:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/loyalty/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching loyalty stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-95a96d8e/loyalty/settings`,
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
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white mb-2">Loyalty & Rewards Program</h1>
        <p className="text-gray-400">Manage your customer rewards and loyalty tiers</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-purple-500" />
              <h3 className="text-white">Members</h3>
            </div>
            <p className="text-3xl text-white">{stats.totalMembers}</p>
            <p className="text-gray-400 text-sm">{stats.activeMembers} active</p>
          </div>
          <div className="bg-gradient-to-br from-black to-pink-900/20 border border-pink-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-pink-500" />
              <h3 className="text-white">Points Issued</h3>
            </div>
            <p className="text-3xl text-white">{stats.totalPointsIssued.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total earned</p>
          </div>
          <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-6 h-6 text-purple-500" />
              <h3 className="text-white">Points Redeemed</h3>
            </div>
            <p className="text-3xl text-white">{stats.totalPointsRedeemed.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total used</p>
          </div>
          <div className="bg-gradient-to-br from-black to-pink-900/20 border border-pink-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-pink-500" />
              <h3 className="text-white">Available</h3>
            </div>
            <p className="text-3xl text-white">
              {(stats.totalPointsIssued - stats.totalPointsRedeemed).toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm">Active points</p>
          </div>
        </div>
      )}

      {/* Reward Tiers */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-6 flex items-center gap-2">
          <Award className="w-6 h-6" />
          Reward Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-xl p-6"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white text-center text-xl mb-2">{tier.name}</h3>
              <p className="text-center text-gray-400 text-sm mb-4">
                {tier.minPoints.toLocaleString()}+ points
              </p>
              <ul className="space-y-2">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
        <h2 className="text-white mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Points Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-300 mb-2">Points Per Rupee Spent</label>
            <input
              type="number"
              value={settings.pointsPerRupee}
              onChange={(e) => setSettings({ ...settings, pointsPerRupee: parseFloat(e.target.value) })}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              step="0.1"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Signup Bonus</label>
            <input
              type="number"
              value={settings.signupBonus}
              onChange={(e) => setSettings({ ...settings, signupBonus: parseInt(e.target.value) })}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Referral Bonus</label>
            <input
              type="number"
              value={settings.referralBonus}
              onChange={(e) => setSettings({ ...settings, referralBonus: parseInt(e.target.value) })}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Birthday Bonus</label>
            <input
              type="number"
              value={settings.birthdayBonus}
              onChange={(e) => setSettings({ ...settings, birthdayBonus: parseInt(e.target.value) })}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Review Bonus</label>
            <input
              type="number"
              value={settings.reviewBonus}
              onChange={(e) => setSettings({ ...settings, reviewBonus: parseInt(e.target.value) })}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Minimum Redemption Points</label>
            <input
              type="number"
              value={settings.minimumRedemption}
              onChange={(e) => setSettings({ ...settings, minimumRedemption: parseInt(e.target.value) })}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Points Value (points per ₹1)</label>
            <input
              type="number"
              value={settings.redemptionValue}
              onChange={(e) => setSettings({ ...settings, redemptionValue: parseInt(e.target.value) })}
              className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              min="1"
            />
            <p className="text-gray-500 text-sm mt-1">
              {settings.redemptionValue} points = ₹1 discount
            </p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg transition-all"
        >
          Save Settings
        </button>
      </div>

      {/* Top Members */}
      {stats && stats.topMembers.length > 0 && (
        <div className="bg-gradient-to-br from-black to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-white mb-6">Top Loyalty Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/30">
                  <th className="text-left text-gray-400 py-3 px-4">Rank</th>
                  <th className="text-left text-gray-400 py-3 px-4">Name</th>
                  <th className="text-left text-gray-400 py-3 px-4">Email</th>
                  <th className="text-right text-gray-400 py-3 px-4">Points</th>
                  <th className="text-center text-gray-400 py-3 px-4">Tier</th>
                </tr>
              </thead>
              <tbody>
                {stats.topMembers.map((member, index) => (
                  <tr key={member.email} className="border-b border-purple-500/10 hover:bg-purple-900/10">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        {index > 2 && <span className="text-gray-400">#{index + 1}</span>}
                      </div>
                    </td>
                    <td className="text-white py-3 px-4">{member.name}</td>
                    <td className="text-gray-300 py-3 px-4">{member.email}</td>
                    <td className="text-white py-3 px-4 text-right">{member.points.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        member.tier === 'Platinum' ? 'bg-purple-600' :
                        member.tier === 'Gold' ? 'bg-yellow-600' :
                        member.tier === 'Silver' ? 'bg-gray-600' :
                        'bg-amber-700'
                      }`}>
                        {member.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
