"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, TriangleAlert } from "lucide-react";

const nav = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Manage Listings",
    href: "/admin/manage-listings",
    icon: ListChecks,
  },
  {
    label: "Reported Listings",
    href: "/admin/reported-listings",
    icon: TriangleAlert,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="h-full flex flex-col">
      {/* <div className="px-4 py-5 border-b">
        <Link href="/admin" className="block">
          <div className="text-xl font-bold">Admin</div>
          <div className="text-xs text-gray-500">Campus Marketplace</div>
        </Link>
      </div> */}

      <ul className="flex-1 pb-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  "group flex items-center gap-3 px-4 py-2 text-sm " +
                  (active
                    ? "bg-gray-100 font-medium text-gray-900 border-r-2 border-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")
                }
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* <div className="px-4 py-4 border-t text-xs text-gray-500">
        © {new Date().getFullYear()} CMPE 202
      </div> */}
    </nav>
  );
}