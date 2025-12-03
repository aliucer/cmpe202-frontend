"use client";

import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingForm from "../../new-listings/ListingForm";

export default function EditListingPage() {
  const params = useParams();
  const listingId = params?.id as string;

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-start bg-white py-12">
        <div className="bg-white text-black rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#0033A0]">
            Edit Listing
          </h1>

          {/* Reuse the same ListingForm component */}
          <ListingForm listingId={listingId} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

