export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4 py-20">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 animate-pulse">
        Loading SkillSync...
      </p>
    </div>
  );
}
