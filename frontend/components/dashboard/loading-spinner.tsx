export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100/50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-[#551931] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}