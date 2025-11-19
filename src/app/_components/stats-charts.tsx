"use client";

import { api } from "~/trpc/react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

export function StatsCharts() {
  const { data: stats, isLoading } = api.contact.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const bandData = Object.entries(stats.bandCounts).map(([band, count]) => ({
    name: band,
    value: count,
  }));

  const modeData = Object.entries(stats.modeCounts).map(([mode, count]) => ({
    name: mode,
    value: count,
  }));

  const pathTypeData = Object.entries(stats.pathTypeCounts).map(([pathType, count]) => ({
    name: pathType,
    value: count,
  }));

  const frequencyData = Object.entries(stats.frequencyRanges)
    .map(([range, count]) => ({
      name: range,
      value: count,
    }))
    .sort((a, b) => {
      const aNum = parseFloat(a.name);
      const bNum = parseFloat(b.name);
      return aNum - bNum;
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Band Distribution */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Contacts by Band</h3>
          {bandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bandData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bandData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No band data available</p>
          )}
        </div>

        {/* Mode Distribution */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Contacts by Mode</h3>
          {modeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No mode data available</p>
          )}
        </div>
      </div>

      {/* Frequency Distribution */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Contacts by Frequency Range
        </h3>
        {frequencyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Contacts" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No frequency data available</p>
        )}
      </div>

      {/* Path Type Distribution */}
      <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Contacts by Mode</h3>
          {pathTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pathTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pathTypeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No mode data available</p>
          )}
        </div>
    </div>
  );
}

