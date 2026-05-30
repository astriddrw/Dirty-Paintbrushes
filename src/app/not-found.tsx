import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <p className="text-blue-600 text-sm font-semibold mb-3">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-400 text-sm mb-8">This page doesn&apos;t exist or has been moved.</p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Return to home
      </Link>
    </div>
  );
}
