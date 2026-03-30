function TabButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-accent text-white shadow-premium'
          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
      }`}
    >
      {label}
    </button>
  );
}

export function FilterTabs({ brands, categories, activeBrand, activeCategory, setActiveBrand, setActiveCategory }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <TabButton key={brand} label={brand} active={activeBrand === brand} onClick={() => setActiveBrand(brand)} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <TabButton
            key={category}
            label={category}
            active={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          />
        ))}
      </div>
    </div>
  );
}
