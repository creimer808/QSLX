"use client";

import { api } from "~/trpc/react";
import { Radio, MapPin, Globe, TrendingUp } from "lucide-react";

export function DashboardStats() {
  const { data: stats, isLoading } = api.contact.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200"></div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      icon: Radio,
      color: "bg-blue-500",
    },
    {
      title: "Unique Callsigns",
      value: stats.uniqueCallsigns,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Countries Worked",
      value: stats.uniqueCountries,
      icon: Globe,
      color: "bg-purple-500",
    },
    {
      title: "Bands Active",
      value: Object.keys(stats.bandCounts).length,
      icon: MapPin,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-full ${stat.color} p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

