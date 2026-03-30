"use client";

import { useState } from "react";
import { X, Plus, Calendar, User, Bell, FileText, Gift } from "lucide-react";

export default function AddEventModal({
  isOpen,
  onClose,
  onEventAdded,
  initialDate = ""
}) {
  const emptyForm = {
    title: "",
    date: initialDate,
    time: "",
    type: "birthday",
    person: "",
    reminder: "1 day before",
    notes: "",
    gift: "",
    privacy: "private"
  };

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const next = {};

    if (!form.title.trim()) {
      next.title = "Event title is required";
    }

    if (!form.date) {
      next.date = "Please select a date";
    } else {
      const selected = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        next.date = "Event date can’t be in the past";
      }
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const problems = validate();
    if (Object.keys(problems).length) {
      setErrors(problems);
      return;
    }

    setSaving(true);

    try {
      const eventDate = new Date(form.date);
      eventDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const daysUntil = Math.ceil(
        (eventDate - today) / (1000 * 60 * 60 * 24)
      );

      const event = {
        id: Date.now().toString(),
        title: form.title,
        person: form.person || "Someone special",
        type: form.type,
        date: eventDate.toISOString(),
        formattedDate: eventDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        }),
        time: form.time,
        reminder: form.reminder,
        notes: form.notes,
        gift: form.gift,
        privacy: form.privacy,
        daysUntil,
        createdAt: new Date().toISOString()
      };

      await new Promise(res => setTimeout(res, 500));

      onEventAdded?.(event);
      setForm(emptyForm);
      setErrors({});
      onClose();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const eventTypes = [
    { value: "birthday", label: "Birthday", emoji: "🎂" },
    { value: "anniversary", label: "Anniversary", emoji: "💍" },
    { value: "wedding", label: "Wedding", emoji: "👰" },
    { value: "graduation", label: "Graduation", emoji: "🎓" },
    { value: "holiday", label: "Holiday", emoji: "🎄" },
    { value: "other", label: "Other", emoji: "📅" }
  ];

  const reminders = [
    "On the day",
    "1 day before",
    "3 days before",
    "1 week before",
    "2 weeks before",
    "No reminder"
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add New Event
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Remember important dates
            </p>
          </div>

          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="e.g. Mom’s Birthday"
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Event type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {eventTypes.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() =>
                    updateField({ target: { name: "type", value: t.value } })
                  }
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                    form.type === t.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={updateField}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.date ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={updateField}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Remind me
            </label>
            <select
              name="reminder"
              value={form.reminder}
              onChange={updateField}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600"
            >
              {reminders.map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="flex-1 py-3 border-2 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2 ${
                saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Adding..." : <>
                <Plus className="w-5 h-5" /> Add Event
              </>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
