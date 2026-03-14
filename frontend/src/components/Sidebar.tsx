import { Link, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

const NAV_FAVORITES_KEY = 'nav-favorites';

export interface NavCategoryItem {
  name: string;
  path: string;
}

export interface NavCategory {
  id: string;
  label: string;
  /** Principal: sempre aberta e recebe os favoritos */
  alwaysOpen?: boolean;
  items: NavCategoryItem[];
  defaultCollapsed?: boolean;
}

export interface NavItem {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  isSection?: boolean;
  children?: NavItem[];
  defaultCollapsed?: boolean;
}

interface SidebarProps {
  /** Estrutura por categorias (header, Principal + accordion, footer) */
  categories?: NavCategory[];
  /** Legado: lista plana; quando categories não é passado, usa items no modo antigo (sem favoritos) */
  items?: NavItem[];
  user?: { email?: string | null; name?: string | null; role?: string | null };
  onLogout?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function isActivePath(path: string, current: string): boolean {
  if (path === '/') return current === '/';
  return current === path || current.startsWith(path + '/');
}

/** Retorna o path do menu que deve ficar ativo: o mais específico que bate com pathname (evita /vendas ativo em /vendas/caixa). */
function getActivePath(pathname: string, allPaths: string[]): string | null {
  const matching = allPaths.filter(
    (p) => p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')
  );
  if (matching.length === 0) return null;
  return matching.reduce((a, b) => (a.length >= b.length ? a : b));
}

function getFavoritePaths(): string[] {
  try {
    const raw = localStorage.getItem(NAV_FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
  } catch {
    return [];
  }
}

function setFavoritePaths(paths: string[]): void {
  try {
    localStorage.setItem(NAV_FAVORITES_KEY, JSON.stringify(paths));
  } catch {
    /* ignore */
  }
}

function findItemNameByPath(categories: NavCategory[], path: string): string | null {
  for (const cat of categories) {
    const item = cat.items.find((i) => i.path === path);
    if (item) return item.name;
  }
  return null;
}

export function Sidebar({
  categories = [],
  items = [],
  user,
  onLogout,
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const onMobileCloseRef = useCallback(() => onMobileClose?.(), [onMobileClose]);

  useEffect(() => {
    onMobileClose?.();
  }, [pathname, onMobileClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) onMobileClose?.();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen, onMobileClose]);

  const [favorites, setFavorites] = useState<string[]>(getFavoritePaths);
  const syncFavorites = useCallback((next: string[]) => {
    setFavorites(next);
    setFavoritePaths(next);
  }, []);

  const toggleFavorite = useCallback((path: string) => {
    setFavorites((prev) => {
      const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path];
      setFavoritePaths(next);
      return next;
    });
  }, []);

  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      if (cat.alwaysOpen) initial[cat.id] = true;
      else initial[cat.id] = cat.defaultCollapsed ? false : true;
    });
    return initial;
  });

  const [legacyGroupOpen, setLegacyGroupOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.children?.length && item.defaultCollapsed !== undefined) {
        initial[item.name] = !item.defaultCollapsed;
      } else if (item.children?.length) {
        initial[item.name] = true;
      }
    });
    return initial;
  });

  const allPaths = useMemo(
    () => categories.flatMap((c) => c.items.map((i) => i.path)),
    [categories]
  );
  const activePath = useMemo(() => getActivePath(pathname, allPaths), [pathname, allPaths]);

  const categoryWithActive = useMemo(() => {
    if (!activePath) return null;
    for (const cat of categories) {
      if (cat.items.some((i) => i.path === activePath)) return cat.id;
    }
    return null;
  }, [categories, activePath]);

  useEffect(() => {
    if (categoryWithActive) setGroupOpen((prev) => ({ ...prev, [categoryWithActive]: true }));
  }, [categoryWithActive]);

  const principalItemsWithFavorites = useMemo(() => {
    const principal = categories.find((c) => c.alwaysOpen);
    if (!principal) return [];
    const fromFavorites = favorites
      .filter((path) => !principal.items.some((i) => i.path === path))
      .map((path) => ({ name: findItemNameByPath(categories, path) ?? path, path }))
      .filter((i) => i.name);
    return [...principal.items, ...fromFavorites];
  }, [categories, favorites]);

  const sidebarContent = useMemo(() => {
    if (categories.length > 0) {
      return (
        <>
          <div className="px-5 pt-6 pb-4">
            <Link to="/" className="block" onClick={collapsed ? undefined : onMobileClose}>
              <img src="/logo.png" alt="Saldão de Móveis Jerusalém" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {categories.map((cat) => {
              if (cat.alwaysOpen) {
                return (
                  <div key={cat.id} className="space-y-0.5">
                    <div className="px-3 py-2.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-subtle)]">
                      {cat.label}
                    </div>
                    {principalItemsWithFavorites.map((item) => {
                      const isActive = item.path === activePath;
                      return (
                        <div key={item.path} className="flex items-center gap-0.5">
                          <Link
                            to={item.path}
                            onClick={onMobileClose}
                            className={`
                              flex-1 flex items-center py-2.5 px-3 rounded-xl text-sm font-medium truncate
                              transition-all duration-200 min-h-[40px]
                              ${isActive
                                ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]'
                                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text)]'}
                            `}
                            style={isActive ? { borderLeft: '3px solid var(--color-accent)' } : undefined}
                          >
                            {item.name}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              const isOpen = groupOpen[cat.id] ?? !cat.defaultCollapsed;
              const hasActiveInCat = cat.items.some((i) => i.path === activePath);

              return (
                <div key={cat.id} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setGroupOpen((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                    className={`
                      flex w-full items-center justify-between px-3 py-2.5 rounded-xl
                      text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-subtle)]
                      transition-all duration-200
                      ${hasActiveInCat ? 'bg-[var(--color-accent-muted)]/50 md:bg-transparent' : ''}
                    `}
                    aria-expanded={isOpen}
                  >
                    {cat.label}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-200 ease-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-0.5 pb-1">
                        {cat.items.map((item) => {
                          const isActive = item.path === activePath;
                          const isFav = favorites.includes(item.path);
                          return (
                            <div key={item.path} className="flex items-center gap-0.5">
                              <Link
                                to={item.path}
                                onClick={onMobileClose}
                                className={`
                                  flex-1 flex items-center py-2.5 px-3 rounded-xl text-sm font-medium truncate
                                  transition-all duration-200 min-h-[40px]
                                  ${isActive
                                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]'
                                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text)]'}
                                `}
                                style={isActive ? { borderLeft: '3px solid var(--color-accent)' } : undefined}
                              >
                                {item.name}
                              </Link>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleFavorite(item.path);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-[var(--color-border-muted)] hover:text-[var(--color-accent)] transition-colors"
                                aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                              >
                                {isFav ? (
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-[var(--color-border)] px-2 py-3 flex flex-col gap-0.5">
            <Link
              to="/conta"
              onClick={onMobileClose}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
            >
              Minha conta
            </Link>
            {onLogout && (
              <button
                type="button"
                onClick={() => { onMobileClose?.(); onLogout(); }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
              >
                Sair
              </button>
            )}
          </div>
        </>
      );
    }

    // Modo legado: lista plana (items) sem categorias/favoritos
    const toggleLegacyGroup = (name: string) => setLegacyGroupOpen((p) => ({ ...p, [name]: !p[name] }));

    const anyChildActive = (children: NavItem[], current: string): boolean =>
      children.some((c) => c.path && isActivePath(c.path, current));

    return (
      <>
        <div className="px-5 pt-6 pb-4">
          <Link to="/">
            <img src="/logo.png" alt="Saldão de Móveis Jerusalém" className="h-10 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {items.map((item, index) => {
            if (item.isSection) {
              return (
                <div key={`s-${index}`} className="px-3 py-2.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-subtle)]">
                  {item.name}
                </div>
              );
            }
            if (item.children?.length) {
              const isOpen = legacyGroupOpen[item.name] ?? !item.defaultCollapsed;
              const hasActive = anyChildActive(item.children, pathname);
              return (
                <div key={`g-${index}`} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleLegacyGroup(item.name)}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-subtle)] rounded-xl hover:bg-[var(--color-border-muted)]"
                    aria-expanded={isOpen}
                  >
                    {item.name}
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="grid transition-[grid-template-rows] duration-200 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                      <div className="space-y-0.5">
                        {item.children.map((c) => {
                          if (!c.path) return null;
                          const isActive = isActivePath(c.path, pathname);
                          return (
                            <Link
                              key={c.path}
                              to={c.path}
                              onClick={onMobileClose}
                              className={`flex items-center py-2.5 px-3 rounded-xl text-sm font-medium truncate transition-all duration-200 ${isActive ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text)]'}`}
                              style={isActive ? { borderLeft: '3px solid var(--color-accent)' } : undefined}
                            >
                              {c.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            if (!item.path) return null;
            const isActive = isActivePath(item.path, pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`flex items-center py-2.5 px-3 rounded-xl text-sm font-medium truncate transition-all duration-200 ${isActive ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent-foreground)]' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text)]'}`}
                style={isActive ? { borderLeft: '3px solid var(--color-accent)' } : undefined}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        {onLogout && (
          <div className="border-t border-[var(--color-border)] px-2 py-3">
            <button
              type="button"
              onClick={() => { onMobileClose?.(); onLogout(); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text)]"
            >
              Sair
            </button>
          </div>
        )}
      </>
    );
  }, [
    categories,
    items,
    user,
    onLogout,
    onMobileClose,
    collapsed,
    pathname,
    activePath,
    groupOpen,
    legacyGroupOpen,
    principalItemsWithFavorites,
    favorites,
    toggleFavorite,
  ]);

  const overlay = onMobileClose && mobileOpen && (
    <div
      role="button"
      tabIndex={-1}
      aria-label="Fechar menu"
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
      onClick={onMobileClose}
    />
  );

  const asideDesktop = (
    <aside
      className={`
        hidden md:flex flex-col h-screen sticky top-0 bg-[var(--color-surface)] border-r border-[var(--color-border)]
        transition-[width] duration-300 overflow-hidden
        ${collapsed ? 'w-0' : 'w-[260px]'}
      `}
    >
      {!collapsed && sidebarContent}
    </aside>
  );

  const asideMobile = (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] bg-[var(--color-surface)] border-r border-[var(--color-border)] shadow-xl
        transition-transform duration-300 ease-out md:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {sidebarContent}
    </aside>
  );

  const collapseButton = onToggleCollapse && (
    <button
      type="button"
      onClick={onToggleCollapse}
      className="fixed z-50 top-5 w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text)] transition-all duration-300 hidden md:flex"
      style={{ left: collapsed ? 12 : 248 }}
      aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
      title={collapsed ? 'Expandir menu' : 'Recolher menu'}
    >
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );

  return (
    <>
      {overlay}
      {asideDesktop}
      {asideMobile}
      {collapseButton}
    </>
  );
}
