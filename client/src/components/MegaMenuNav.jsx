import { useState } from 'react';

const menu = [
  {
    label: 'Esportes',
    sections: [
      { title: 'Modalidades', items: ['Corrida', 'Futebol', 'Treino'] },
      { title: 'Destaques', items: ['Performance', 'Outdoor', 'Academia'] }
    ]
  },
  {
    label: 'Homens',
    sections: [
      { title: 'Calçados', items: ['Tênis', 'Chinelos', 'Bota de trilha', 'Chuteiras'] },
      { title: 'Roupas', items: ['Camisetas', 'Calças', 'Moletons'] }
    ]
  },
  {
    label: 'Mulheres',
    sections: [
      { title: 'Calçados', items: ['Tênis', 'Chinelos', 'Bota de trilha'] },
      { title: 'Roupas', items: ['Leggings', 'Camisetas', 'Jaquetas'] }
    ]
  },
  {
    label: 'Crianças',
    sections: [
      { title: 'Calçados', items: ['Tênis infantil', 'Chinelos infantis'] },
      { title: 'Roupas', items: ['Conjuntos', 'Camisetas', 'Moletons'] }
    ]
  },
  {
    label: 'Calçados',
    sections: [
      { title: 'Tipos', items: ['Tênis', 'Chinelos', 'Bota de trilha', 'Chuteiras'] }
    ]
  },
  {
    label: 'Roupas',
    sections: [
      { title: 'Tipos', items: ['Camisetas', 'Calças', 'Moletons', 'Leggings'] }
    ]
  }
];

export function MegaMenuNav({ onSelect }) {
  const [openMenu, setOpenMenu] = useState('');

  return (
    <nav className="relative rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3">
      <ul className="flex flex-wrap gap-2 sm:gap-3">
        {menu.map((entry) => (
          <li
            key={entry.label}
            className="relative"
            onMouseEnter={() => setOpenMenu(entry.label)}
            onMouseLeave={() => setOpenMenu('')}
          >
            <button className="rounded-full px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 hover:text-white">
              {entry.label}
            </button>

            {openMenu === entry.label && (
              <div className="absolute left-0 top-11 z-20 w-[340px] rounded-2xl border border-zinc-700 bg-zinc-950 p-4 shadow-2xl">
                <div className="grid gap-3 sm:grid-cols-2">
                  {entry.sections.map((section) => (
                    <div key={section.title}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-400">{section.title}</p>
                      <ul className="space-y-1">
                        {section.items.map((item) => (
                          <li key={item}>
                            <button
                              onClick={() => {
                                onSelect({ menu: entry.label, item });
                                setOpenMenu('');
                              }}
                              className="text-left text-sm text-zinc-200 transition hover:text-accent"
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
