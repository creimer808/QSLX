"use client";

import { format } from "date-fns";
import { Trash2, Edit } from "lucide-react";
import { api } from "~/trpc/react";
import { useState } from "react";
import { ContactEditForm } from "./contact-edit-form";

export function ContactList() {
  const { data: contacts, isLoading } = api.contact.getAll.useQuery();
  const utils = api.useUtils();
  const deleteContact = api.contact.delete.useMutation({
    onSuccess: () => {
      void utils.contact.getAll.invalidate();
      void utils.contact.getStats.invalidate();
      void utils.contact.getMapData.invalidate();
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading contacts...</div>;
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-gray-500">
        <p>No contacts logged yet. Start logging your first contact!</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Callsign
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Band
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Mode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Frequency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  RST
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {format(contact.date, "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {contact.callsign}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {contact.band || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {contact.mode || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {contact.frequency ? `${contact.frequency.toFixed(3)} MHz` : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {contact.rstSent && contact.rstReceived
                      ? `${contact.rstSent}/${contact.rstReceived}`
                      : contact.rstSent || contact.rstReceived || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {contact.country}
                    {contact.state && `, ${contact.state}`}
                    {contact.gridSquare && ` (${contact.gridSquare})`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(contact.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit contact"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete contact with ${contact.callsign}?`
                            )
                          ) {
                            deleteContact.mutate({ id: contact.id });
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete contact"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingId && (
        <ContactEditForm
          contactId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}

