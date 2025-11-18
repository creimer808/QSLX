import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { ContactCalendar } from "../_components/contact-calendar";

export default async function CalendarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Calendar</h1>
          <p className="mt-2 text-gray-600">
            View your contacts in a calendar format
          </p>
        </div>

        <ContactCalendar />
      </div>
    </div>
  );
}

