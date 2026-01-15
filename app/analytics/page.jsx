// pages/analytics.js
"use client";
import { useState } from "react";
import { TrendingUp, Gift, Users, Calendar, DollarSign, PieChart, BarChart3 } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("month");

  const stats = [
    { label: "Total Spent", value: "₦245,000", change: "+12%", positive: false },
    { label: "Gifts Sent", value: "47", change: "+8%", positive: true },
    { label: "People", value: "24", change: "+15%", positive: true },
    { label: "Events", value: "18", change: "+5%", positive: true },
  ];

  const spendingByCategory = [
    { category: "Birthdays", amount: 120000, percentage: 49, color: "bg-pink-500" },
    { category: "Weddings", amount: 65000, percentage: 27, color: "bg-green-500" },
    { category: "Anniversaries", amount: 35000, percentage: 14, color: "bg-blue-500" },
    { category: "Holidays", amount: 25000, percentage: 10, color: "bg-purple-500" },
  ];

  const monthlySpending = [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 38000 },
    { month: "Mar", amount: 52000 },
    { month: "Apr", amount: 41000 },
    { month: "May", amount: 48000 },
    { month: "Jun", amount: 55000 },
    { month: "Jul", amount: 42000 },
    { month: "Aug", amount: 58000 },
    { month: "Sep", amount: 51000 },
    { month: "Oct", amount: 47000 },
    { month: "Nov", amount: 53000 },
    { month: "Dec", amount: 62000 },
  ];

  const topRecipients = [
    { name: "Sarah Johnson", amount: 75000, gifts: 5 },
    { name: "Emily Davis", amount: 120000, gifts: 8 },
    { name: "Michael Brown", amount: 45000, gifts: 2 },
    { name: "David Wilson", amount: 35000, gifts: 3 },
    { name: "Jennifer Lee", amount: 15000, gifts: 1 },
  ];

  const maxSpending = Math.max(...monthlySpending.map(m => m.amount));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
            <p className="text-gray-600">Track your gift spending and patterns</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            {["week", "month", "year"].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  index === 0 ? 'bg-red-100 text-red-600' :
                  index === 1 ? 'bg-green-100 text-green-600' :
                  index === 2 ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {index === 0 ? <DollarSign className="w-6 h-6" /> :
                   index === 1 ? <Gift className="w-6 h-6" /> :
                   index === 2 ? <Users className="w-6 h-6" /> :
                   <Calendar className="w-6 h-6" />}
                </div>
                <span className={`text-sm font-medium ${
                  stat.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Spending</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="flex items-end justify-between h-48">
              {monthlySpending.map((month, index) => (
                <div key={month.month} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-500 mb-2">{month.month}</div>
                  <div
                    className="w-8 bg-linear-to-t from-purple-500 to-purple-300 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(month.amount / maxSpending) * 80}%` }}
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    ₦{(month.amount / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Spending by Category</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {spendingByCategory.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 w-16 text-right">
                      ₦{item.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Recipients */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Top Recipients</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topRecipients.map((recipient, index) => (
              <div key={recipient.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold">
                    {recipient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{recipient.name}</p>
                    <p className="text-sm text-gray-500">{recipient.gifts} gifts</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₦{recipient.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {((recipient.amount / 245000) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}