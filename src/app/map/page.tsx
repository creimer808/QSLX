import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { ContactMap } from "../_components/contact-map";

export default async function MapPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Map</h1>
          <p className="mt-2 text-gray-600">
            Visualize all your contacts on a world map
          </p>
        </div>

        <ContactMap />
      </div>
    </div>
  );
}

