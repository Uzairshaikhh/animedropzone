export function AdminPage() {
  console.log("AdminPage component is rendering");
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black text-white flex items-center justify-center">
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-purple-400 mb-4">Admin Panel Test</h1>
        <p className="text-gray-300 mb-4">If you can see this, the admin panel is loading correctly.</p>
      </div>
    </div>
  );
}
