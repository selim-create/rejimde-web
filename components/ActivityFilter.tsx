'use client';

interface ActivityFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { value: 'all', label: 'Tümü', icon: 'fa-list' },
  { value: 'points', label: 'Puanlar', icon: 'fa-star' },
  { value: 'programs', label: 'Programlar', icon: 'fa-clipboard-list' },
  { value: 'social', label: 'Sosyal', icon: 'fa-users' },
  { value: 'health', label: 'Sağlık', icon: 'fa-heart-pulse' },
  { value: 'level', label: 'Level/Circle', icon: 'fa-trophy' },
  { value: 'other', label: 'Diğer', icon: 'fa-ellipsis' },
];

export default function ActivityFilter({ filter, onFilterChange }: ActivityFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition ${
            filter === f.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <i className={`fa-solid ${f.icon}`}></i>
          {f.label}
        </button>
      ))}
    </div>
  );
}
