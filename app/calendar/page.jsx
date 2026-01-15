// pages/calendar.js


// This is a page for the calendar view where users can see and manage their events


"use client";
import { useState } from "react";
import AddEventModal from '../components/AddEventModal';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
 const [showAddEventModal, setShowAddEventModal] = useState(false);
  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const events = [
    { id: 1, date: new Date(2024, 11, 20), title: "Sarah's Birthday", type: "birthday" },
    { id: 2, date: new Date(2024, 11, 25), title: "Christmas Dinner", type: "holiday" },
    { id: 3, date: new Date(2024, 11, 25), title: "Michael's Wedding", type: "wedding" },
    { id: 4, date: new Date(2024, 11, 31), title: "New Year's Eve", type: "holiday" },
  ];

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };
  const handleAddEvent = (newEvent) => {
  setEvents(prev => [newEvent, ...prev]);
};

  const getDayClass = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();

    let classes = "w-8 h-8 flex items-center justify-center rounded-full text-sm ";
    
    if (isSelected) {
      classes += "bg-purple-600 text-white";
    } else if (isToday) {
      classes += "bg-purple-100 text-purple-700";
    } else if (!isCurrentMonth) {
      classes += "text-gray-400";
    } else {
      classes += "text-gray-700 hover:bg-gray-100";
    }
    
    return classes;
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), -firstDay + i + 1);
      days.push(
        <button key={`prev-${i}`} className={getDayClass(date)}>
          {date.getDate()}
        </button>
      );
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayEvents = getEventsForDate(date);
      
      days.push(
        <button 
          key={i} 
          className={getDayClass(date)}
          onClick={() => setSelectedDate(date)}
        >
          {i}
          {dayEvents.length > 0 && (
            <div className="absolute bottom-1 flex gap-1">
              {dayEvents.slice(0, 2).map(event => (
                <div 
                  key={event.id}
                  className={`w-1 h-1 rounded-full ${
                    event.type === 'birthday' ? 'bg-pink-500' :
                    event.type === 'wedding' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />
              ))}
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Calendar</h1>
            <p className="text-gray-600">Manage your events and reminders</p>
          </div>
          <button 
  onClick={() => setShowAddEventModal(true)}
  className="flex items-center gap-2 px-3 py-2 text-white bg-purple-600 rounded-lg text-sm hover:bg-purple-700 transition"
>
  <Plus className="w-4 h-4" />
   Add Event
</button>

<AddEventModal 
  isOpen={showAddEventModal}
  onClose={() => setShowAddEventModal(false)}
  onEventAdded={handleAddEvent}
/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>
          </div>

          {/* Sidebar - Events */}
          <div className="space-y-6">
            {/* Selected Date */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        event.type === 'birthday' ? 'bg-pink-500' :
                        event.type === 'wedding' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{event.title}</p>
                        <p className="text-sm text-gray-500 capitalize">{event.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No events scheduled</p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {events.slice(0, 3).map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="text-center min-w-12">
                      <p className="font-bold text-purple-600">{event.date.getDate()}</p>
                      <p className="text-xs text-gray-500">
                        {event.date.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <p className="text-sm text-gray-500 capitalize">{event.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}