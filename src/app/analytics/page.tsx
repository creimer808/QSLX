import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { StatsCharts } from "../_components/stats-charts";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Analyze your contact patterns and statistics
          </p>
        </div>

        <StatsCharts />
      </div>
    </div>
  );
}

