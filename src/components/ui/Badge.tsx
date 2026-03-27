import type { BCNewsCategory } from '../../types/newsapi';
import { getCategoryColor } from '../../data/category-colors';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'category';
  category?: BCNewsCategory;
  size?: 'sm' | 'md';
}

const variantClasses: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-500 text-slate-950',
  secondary: 'bg-secondary-500 text-white',
  outline: 'border border-slate-300 text-slate-600 bg-transparent',
};

export default function Badge({ children, variant = 'default', category, size = 'sm' }: BadgeProps) {
  let colorClasses: string;

  if (category) {
    const c = getCategoryColor(category);
    colorClasses = `${c.bg} ${c.text}`;
  } else {
    colorClasses = variantClasses[variant] || variantClasses.default;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${colorClasses}`}
    >
      {children}
    </span>
  );
}
