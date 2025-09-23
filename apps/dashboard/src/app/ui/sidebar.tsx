"use client";

import { Trophy, Users, Star, TrendingUp, Award, Activity, Bell } from "lucide-react";

const recentActivities = [
  { 
    id: 1, 
    title: "Joined Match", 
    description: "You joined a weekend tennis game.", 
    time: "2h ago",
    type: "game",
    icon: Trophy
  },
  { 
    id: 2, 
    title: "New Connection", 
    description: "You connected with Jane Smith.", 
    time: "5h ago",
    type: "social",
    icon: Users
  },
  { 
    id: 3, 
    title: "Rating Updated", 
    description: "Your rating increased to 4.8⭐", 
    time: "1d ago",
    type: "achievement",
    icon: Star
  },
];

const achievements = [
  { title: "First Win", description: "Won your first match", icon: "🏆" },
  { title: "Social Player", description: "Connected with 25+ players", icon: "🤝" },
  { title: "Regular", description: "Played 10+ games", icon: "🎾" },
];

export default function Sidebar() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="bg-green-500 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy className="text-white" size={28} />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">12</h3>
          <p className="text-green-600 font-medium">Games Played</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-xs text-green-500">+3 this week</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="text-white" size={28} />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">28</h3>
          <p className="text-blue-600 font-medium">Connections</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <TrendingUp size={12} className="text-blue-500" />
            <span className="text-xs text-blue-500">+5 this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 text-center">
          <div className="bg-purple-500 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Star className="text-white" size={28} />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">4.8</h3>
          <p className="text-purple-600 font-medium">Rating</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star size={12} className="text-yellow-500 fill-current" />
            <span className="text-xs text-purple-500">Excellent</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Activities</h2>
          <Bell size={20} className="text-gray-400" />
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-full ${
                  activity.type === 'game' ? 'bg-green-100' :
                  activity.type === 'social' ? 'bg-blue-100' :
                  'bg-purple-100'
                }`}>
                  <IconComponent size={16} className={
                    activity.type === 'game' ? 'text-green-600' :
                    activity.type === 'social' ? 'text-blue-600' :
                    'text-purple-600'
                  } />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">{activity.title}</h4>
                  <p className="text-gray-600 text-xs mt-1">{activity.description}</p>
                  <span className="text-gray-400 text-xs">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Achievements</h2>
          <Award size={20} className="text-gray-400" />
        </div>
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">{achievement.title}</h4>
                <p className="text-gray-600 text-xs">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-3 text-left transition-all">
            <div className="flex items-center gap-3">
              <Activity size={20} />
              <span className="font-medium">Create New Game</span>
            </div>
          </button>
          <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-3 text-left transition-all">
            <div className="flex items-center gap-3">
              <Users size={20} />
              <span className="font-medium">Find Players</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}