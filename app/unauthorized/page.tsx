import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-6">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
