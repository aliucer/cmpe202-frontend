"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingForm from "./ListingForm";

export default function ListingFormPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-start bg-white py-12">
        <div className="bg-white text-black rounded-xl shadow-lg p-8 w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#0033A0]">
            Create a New Listing
          </h1>

          {/* The actual backend-connected ListingForm component */}
          <ListingForm />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
