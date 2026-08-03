import type { ReactNode } from 'react';
import { DEV_USERS } from '../data/seed';
import { useAppStore } from '../store/AppStore';

function VMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <defs>
        <linearGradient id="vmark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FEEEB6" />
          <stop offset="0.45" stopColor="#CFAE70" />
          <stop offset="1" stopColor="#B49248" />
        </linearGradient>
      </defs>
      <path d="M4 4 L12.5 4 L16 20 L19.5 4 L28 4 L20.5 28 L11.5 28 Z" fill="url(#vmark)" />
    </svg>
  );
}

export type NavItem = { id: string; label: string };

export function Shell({
  navItems,
  activeNav,
  onNavigate,
  children,
}: {
  navItems: NavItem[];
  activeNav: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
}) {
  const { currentUser, setCurrentUser } = useAppStore();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-vu-gold/20 bg-vu-black">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <VMark />
            <div>
              <div className="font-serif text-lg leading-tight text-vu-white">POD Platform</div>
              <div className="eyebrow text-[0.6875rem] text-vu-gold">Workforce Request System</div>
            </div>
          </div>
          <nav className="flex items-center gap-1" aria-label="Primary">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`cursor-pointer rounded-vu px-4 py-2 font-sans text-sm font-medium transition-colors duration-200 ${
                  activeNav === item.id
                    ? 'bg-vu-gold text-vu-black'
                    : 'text-vu-white hover:text-vu-gold'
                }`}
                aria-current={activeNav === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <label className="flex items-center gap-2 text-sm text-vu-white/70">
            <span className="eyebrow text-[0.6875rem] text-vu-gold/80">Viewing as</span>
            <select
              className="cursor-pointer rounded-vu border border-vu-gold/30 bg-vu-black px-2 py-1.5 text-sm text-vu-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-vu-gold"
              value={currentUser.id}
              onChange={(e) => {
                const u = DEV_USERS.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
            >
              {DEV_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-6 pb-24">{children}</main>
      <footer className="border-t border-vu-gold/20 bg-vu-black py-10">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <p className="font-serif italic text-vu-white/80">Coordination is shared state, not a meeting.</p>
          <p className="mt-2 text-xs text-vu-white/50">People, Culture &amp; Belonging · Vanderbilt University · FY27 pilot</p>
        </div>
      </footer>
    </div>
  );
}
