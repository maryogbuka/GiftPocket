// pages/people.js
"use client";
import { useState } from "react";
import { Users, Plus, Gift, Calendar, Phone, Mail, MoreVertical } from "lucide-react";

export default function People() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Contacts", count: 24 },
    { id: "family", name: "Family", count: 8 },
    { id: "friends", name: "Friends", count: 12 },
    { id: "work", name: "Work", count: 4 },
  ];

  const people = [
    {
      id: 1,
      name: "Sarah Johnson",
      category: "friends",
      relationship: "Best Friend",
      nextEvent: { type: "birthday", date: "Dec 20", daysLeft: 3 },
      phone: "+234 801 234 5678",
      email: "sarah@email.com",
      avatar: "SJ",
      giftsGiven: 5,
      totalSpent: 75000
    },
    {
      id: 2,
      name: "Michael Brown",
      category: "work",
      relationship: "Colleague",
      nextEvent: { type: "wedding", date: "Dec 25", daysLeft: 8 },
      phone: "+234 802 345 6789",
      email: "michael@email.com",
      avatar: "MB",
      giftsGiven: 2,
      totalSpent: 45000
    },
    {
      id: 3,
      name: "Emily Davis",
      category: "family",
      relationship: "Sister",
      nextEvent: { type: "anniversary", date: "Jan 15", daysLeft: 29 },
      phone: "+234 803 456 7890",
      email: "emily@email.com",
      avatar: "ED",
      giftsGiven: 8,
      totalSpent: 120000
    },
    {
      id: 4,
      name: "David Wilson",
      category: "friends",
      relationship: "Friend",
      nextEvent: null,
      phone: "+234 804 567 8901",
      email: "david@email.com",
      avatar: "DW",
      giftsGiven: 3,
      totalSpent: 35000
    },
    {
      id: 5,
      name: "Jennifer Lee",
      category: "work",
      relationship: "Manager",
      nextEvent: { type: "birthday", date: "Jan 8", daysLeft: 22 },
      phone: "+234 805 678 9012",
      email: "jennifer@email.com",
      avatar: "JL",
      giftsGiven: 1,
      totalSpent: 15000
    },
  ];

  const filteredPeople = selectedCategory === "all" 
    ? people 
    : people.filter(person => person.category === selectedCategory);

  const getEventColor = (type) => {
    switch (type) {
      case 'birthday': return 'bg-pink-100 text-pink-700';
      case 'wedding': return 'bg-green-100 text-green-700';
      case 'anniversary': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">People</h1>
            <p className="text-gray-600">Manage your contacts and gift recipients</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Person
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total People</p>
                  <p className="text-2xl font-bold text-gray-800">24</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-800">8</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gifts Given</p>
                  <p className="text-2xl font-bold text-gray-800">47</p>
                </div>
              </div>
            </div>
          </div>

          {/* People Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPeople.map(person => (
                <div key={person.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold">
                        {person.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{person.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{person.relationship}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{person.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{person.email}</span>
                    </div>
                  </div>

                  {/* Next Event */}
                  {person.nextEvent && (
                    <div className="mb-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Next Event</span>
                        <span className="text-xs text-gray-500">{person.nextEvent.daysLeft}d left</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 capitalize">{person.nextEvent.type}</span>
                        <span className="text-sm font-medium text-gray-800">{person.nextEvent.date}</span>
                      </div>
                    </div>
                  )}

                  {/* Gift Stats */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Gifts</p>
                      <p className="font-semibold text-gray-800">{person.giftsGiven}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Spent</p>
                      <p className="font-semibold text-purple-600">₦{person.totalSpent.toLocaleString()}</p>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                      <Gift className="w-4 h-4" />
                      Send Gift
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}