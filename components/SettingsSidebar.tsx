import Link from "next/link";

export default function SettingsSidebar() {
  return (
    <aside className="w-48 min-h-full bg-gray-50 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
      <nav className="flex flex-col gap-4">
        <Link href="/settings/country" className="text-gray-700 dark:text-gray-200 hover:underline">
          Country
        </Link>
        <Link
          href="/settings/address-type"
          className="text-gray-700 dark:text-gray-200 hover:underline"
        >
          Address Type
        </Link>
        <Link href="/settings/gender" className="text-gray-700 dark:text-gray-200 hover:underline">
          Gender
        </Link>
      </nav>
    </aside>
  );
}
