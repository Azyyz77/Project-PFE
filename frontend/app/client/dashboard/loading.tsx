export default function Loading() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-[#65676B] dark:text-[#B0B3B8]">Chargement du dashboard...</p>
      </div>
    </div>
  );
}
