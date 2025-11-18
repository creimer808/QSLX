"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Plus, X } from "lucide-react";

export function ContactForm() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();
  const createContact = api.contact.create.useMutation({
    onSuccess: () => {
      void utils.contact.getAll.invalidate();
      void utils.contact.getStats.invalidate();
      void utils.contact.getMapData.invalidate();
      setIsOpen(false);
      resetForm();
    },
  });

  const [formData, setFormData] = useState({
    callsign: "",
    date: new Date().toISOString().split("T")[0] ?? "",
    frequency: "",
    mode: "",
    band: "",
    rstSent: "",
    rstReceived: "",
    gridSquare: "",
    latitude: "",
    longitude: "",
    country: "",
    state: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      callsign: "",
      date: new Date().toISOString().split("T")[0] ?? "",
      frequency: "",
      mode: "",
      band: "",
      rstSent: "",
      rstReceived: "",
      gridSquare: "",
      latitude: "",
      longitude: "",
      country: "",
      state: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContact.mutate({
      callsign: formData.callsign,
      date: new Date(formData.date),
      frequency: formData.frequency ? parseFloat(formData.frequency) : undefined,
      mode: formData.mode || undefined,
      band: formData.band || undefined,
      rstSent: formData.rstSent || undefined,
      rstReceived: formData.rstReceived || undefined,
      gridSquare: formData.gridSquare || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      country: formData.country || undefined,
      state: formData.state || undefined,
      notes: formData.notes || undefined,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        <Plus className="h-5 w-5" />
        Log Contact
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={() => {
            setIsOpen(false);
            resetForm();
          }}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-4 text-2xl font-bold text-gray-900">Log New Contact</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Callsign *
              </label>
              <input
                type="text"
                required
                value={formData.callsign}
                onChange={(e) =>
                  setFormData({ ...formData, callsign: e.target.value.toUpperCase() })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="W1ABC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Frequency (MHz)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="14.200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Band</label>
              <select
                value={formData.band}
                onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select band</option>
                <option value="160m">160m</option>
                <option value="80m">80m</option>
                <option value="40m">40m</option>
                <option value="20m">20m</option>
                <option value="15m">15m</option>
                <option value="10m">10m</option>
                <option value="6m">6m</option>
                <option value="2m">2m</option>
                <option value="70cm">70cm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select mode</option>
                <option value="SSB">SSB</option>
                <option value="CW">CW</option>
                <option value="FT8">FT8</option>
                <option value="FT4">FT4</option>
                <option value="PSK31">PSK31</option>
                <option value="RTTY">RTTY</option>
                <option value="SSTV">SSTV</option>
                <option value="AM">AM</option>
                <option value="FM">FM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                RST Sent
              </label>
              <input
                type="text"
                value={formData.rstSent}
                onChange={(e) => setFormData({ ...formData, rstSent: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="599"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                RST Received
              </label>
              <input
                type="text"
                value={formData.rstReceived}
                onChange={(e) =>
                  setFormData({ ...formData, rstReceived: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="599"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Grid Square
              </label>
              <input
                type="text"
                value={formData.gridSquare}
                onChange={(e) =>
                  setFormData({ ...formData, gridSquare: e.target.value.toUpperCase() })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="FN20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="40.7128"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="-74.0060"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="United States"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="NY"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createContact.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createContact.isPending ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

