import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { DashboardStats } from "./_components/dashboard-stats";
import { ContactForm } from "./_components/contact-form";
import { ContactList } from "./_components/contact-list";
import { ContactMap } from "./_components/contact-map";
import { StatsCharts } from "./_components/stats-charts";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {session.user.name ?? session.user.email}!
            </p>
          </div>
          <ContactForm />
        </div>

        <div className="mb-8">
          <DashboardStats />
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Quick Stats</h2>
          <StatsCharts />
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Recent Contacts</h2>
          <ContactList />
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Contact Map</h2>
          <ContactMap />
        </div>
      </div>
    </div>
  );
}
