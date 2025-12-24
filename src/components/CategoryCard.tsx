import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function CategoryCard({ icon: Icon, title, description, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="group bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 hover:border-purple-500 rounded-xl p-4 md:p-6 transition-all hover:shadow-lg hover:shadow-purple-900/50 text-left w-full hover:scale-105 active:scale-98"
    >
      <div className="w-12 md:w-14 h-12 md:h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-3 md:mb-4">
        <Icon className="w-6 md:w-7 h-6 md:h-7 text-white" />
      </div>
      <h3 className="mb-1 md:mb-2 text-white text-sm md:text-base font-semibold">{title}</h3>
      <p className="text-gray-400 text-xs md:text-sm line-clamp-2">{description}</p>
    </button>
  );
}
