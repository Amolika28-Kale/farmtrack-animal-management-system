import { useEffect, useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart 
} from "recharts";
import { 
  Beef, Droplet, Heart, TrendingUp, Calendar, Clock, 
  Award, AlertCircle, ArrowUp, ArrowDown, Sprout,
  Milk, Weight, Syringe, Activity 
} from "lucide-react";
import api from "../services/api";
import React from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAnimals: 0,
    totalCows: 0,
    totalBuffaloes: 0,
    totalMilkToday: 0,
    pregnantAnimals: 0,
    milkTrend: 0,
    healthStatus: 'Good',
    avgMilk: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const animalsRes = await api.get("/animals");
      const animals = animalsRes.data;

      // Calculate stats
      const totalAnimals = animals.length;
      const totalCows = animals.filter(a => a.type === "Cow").length;
      const totalBuffaloes = animals.filter(a => a.type === "Buffalo").length;
      const pregnantAnimals = animals.filter(a => a.pregnancyStatus === "Pregnant").length;

      // Calculate milk data
      let totalMilkToday = 0;
      let yesterdayTotal = 0;
      const milkData = [];
      const activities = [];
      
      // Get last 7 days data
      const today = new Date();
      const last7Days = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: date.toISOString().split('T')[0],
          total: 0
        });
      }

      for (const animal of animals) {
        try {
          const milkRes = await api.get(`/milk/${animal._id}`);
          const records = milkRes.data || [];
          
          // Calculate today's milk
          const todayStr = today.toISOString().split('T')[0];
          const todayMilk = records.filter(r => r.date?.startsWith(todayStr));
          if (todayMilk.length > 0) {
            totalMilkToday += todayMilk[0].totalMilk || 0;
          }

          // Calculate yesterday's milk for trend
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          const yesterdayMilk = records.filter(r => r.date?.startsWith(yesterdayStr));
          if (yesterdayMilk.length > 0) {
            yesterdayTotal += yesterdayMilk[0].totalMilk || 0;
          }

          // Add to weekly data
          records.forEach(record => {
            if (record.date) {
              const recordDate = record.date.split('T')[0];
              const dayIndex = last7Days.findIndex(d => d.fullDate === recordDate);
              if (dayIndex !== -1) {
                last7Days[dayIndex].total += record.totalMilk || 0;
              }
            }
          });

          // Add recent activity
          if (records.length > 0) {
            const latest = records[0];
            activities.push({
              id: `milk-${animal._id}`,
              type: 'milk',
              animal: animal.name,
              value: `${latest.totalMilk || 0}L milk recorded`,
              time: new Date(latest.date).toLocaleDateString(),
              icon: Droplet,
              color: 'text-blue-500'
            });
          }
        } catch (e) {
          console.error(`Error loading milk records for ${animal.name}:`, e);
        }
      }

      // Calculate milk trend
      const milkTrend = yesterdayTotal > 0 
        ? ((totalMilkToday - yesterdayTotal) / yesterdayTotal * 100).toFixed(1)
        : 0;

      // Calculate average milk
      const totalMilkWeek = last7Days.reduce((sum, day) => sum + day.total, 0);
      const avgMilk = totalMilkWeek / 7;

      setStats({ 
        totalAnimals, totalCows, totalBuffaloes, totalMilkToday: totalMilkToday.toFixed(1), 
        pregnantAnimals, milkTrend, healthStatus: 'Good', avgMilk: avgMilk.toFixed(1) 
      });
      setChartData(last7Days);
      setRecentActivities(activities.slice(0, 5));
    } catch (e) {
      console.error('Dashboard loading error:', e);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor, trend }) => (
    <div className={`${bgColor} rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`${color} p-2 sm:p-3 rounded-xl bg-white bg-opacity-30`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{label}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const ActivityCard = ({ activity }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <activity.icon className={`w-4 h-4 ${activity.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {activity.animal}
        </p>
        <p className="text-xs text-gray-500 truncate">{activity.value}</p>
      </div>
      <span className="text-xs text-gray-400">{activity.time}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your farm data...</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Cows', value: stats.totalCows, color: '#f97316' },
    { name: 'Buffaloes', value: stats.totalBuffaloes, color: '#6b7280' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Farm Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Manage and monitor your farm's performance
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl shadow-sm w-full sm:w-auto">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <span className="text-sm sm:text-base text-gray-700 font-medium">
            {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          icon={Beef}
          label="Total Animals"
          value={stats.totalAnimals}
          color="text-blue-600"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
        />
        <StatCard
          icon={Milk}
          label="Cows"
          value={stats.totalCows}
          color="text-orange-600"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
        />
        <StatCard
          icon={Weight}
          label="Buffaloes"
          value={stats.totalBuffaloes}
          color="text-gray-600"
          bgColor="bg-gradient-to-br from-gray-50 to-gray-100"
        />
        <StatCard
          icon={Droplet}
          label="Milk Today"
          value={`${stats.totalMilkToday}L`}
          trend={parseFloat(stats.milkTrend)}
          color="text-green-600"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
        />
        <StatCard
          icon={Heart}
          label="Pregnant"
          value={stats.pregnantAnimals}
          color="text-pink-600"
          bgColor="bg-gradient-to-br from-pink-50 to-pink-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Milk Production Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-green-600" />
                Milk Production
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">Last 7 days trend</p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Avg: {stats.avgMilk}L/day</span>
            </div>
          </div>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={35}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMilk)"
                  name="Milk (L)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column - Stats & Activities */}
        <div className="space-y-4 sm:space-y-6">
          {/* Animal Distribution */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Animal Distribution
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mt-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Farm Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Health Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
                  {stats.healthStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Production</span>
                <span className="font-medium text-gray-800">{stats.totalMilkToday}L today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Efficiency</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${Math.min(100, (stats.totalMilkToday / 50) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {Math.min(100, Math.round((stats.totalMilkToday / 50) * 100))}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Recent Activities
          </h2>
          <span className="text-xs text-gray-500">Last 5 records</span>
        </div>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <ActivityCard key={activity.id || index} activity={activity} />
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Efficiency</p>
          <p className="text-xl sm:text-2xl font-bold">85%</p>
          <p className="text-xs opacity-75 mt-1">↑ 12% vs last week</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Health Score</p>
          <p className="text-xl sm:text-2xl font-bold">92%</p>
          <p className="text-xs opacity-75 mt-1">Excellent</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Production</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.avgMilk}L</p>
          <p className="text-xs opacity-75 mt-1">Daily average</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl sm:rounded-2xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Active</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.totalAnimals}</p>
          <p className="text-xs opacity-75 mt-1">Total animals</p>
        </div>
      </div>
    </div>
  );
}