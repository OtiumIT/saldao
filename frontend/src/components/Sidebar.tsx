import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export interface NavItem {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  isSection?: boolean;
  /** Submenu items; when set, this item is a collapsible group (path optional). */
  children?: NavItem[];
  /** Only for items with children: start collapsed (e.g. Cadastros). */
  defaultCollapsed?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function isActivePath(path: string, current: string): boolean {
  if (path === '/') return current === '/';
  return current === path || current.startsWith(path + '/');
}

function anyChildActive(children: NavItem[], current: string): boolean {
  return children.some((c) => c.path && isActivePath(c.path, current));
}

export function Sidebar({
  items,
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const onMobileCloseRef = useRef(onMobileClose);
  onMobileCloseRef.current = onMobileClose;

  useEffect(() => {
    onMobileCloseRef.current?.();
  }, [pathname]);

  // Group open state: key = item name, value = isOpen. Initialize from defaultCollapsed.
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.children?.length && item.defaultCollapsed !== undefined) {
        initial[item.name] = !item.defaultCollapsed;
      } else if (item.children?.length) {
        initial[item.name] = true; // default expanded
      }
    });
    return initial;
  });

  const toggleGroup = (name: string) => {
    setGroupOpen((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navContent = (
    <div className={`py-5 flex flex-col h-full ${collapsed ? 'px-2' : 'px-3'}`}>
      <div className={`flex items-center mb-4 ${collapsed ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
        {collapsed ? (
          <img src="/logo.png" alt="" className="h-8 w-8 object-contain flex-shrink-0" />
        ) : (
          <div className="flex justify-center flex-1 px-2 min-w-0">
            <img
              src="/logo.png"
              alt="Saldão de Móveis Jerusalém"
              className="h-10 w-auto object-contain"
            />
          </div>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        )}
      </div>
      <nav className="space-y-0.5 flex-1 overflow-y-auto">
        {collapsed
          ? (() => {
              // Collapsed: sections as spacing; links as letter; groups as letter that expands sidebar
              return items.map((item, index) => {
                if (item.isSection) return null;
                if (item.children?.length) {
                  const active = anyChildActive(item.children, pathname);
                  return (
                    <button
                      key={`${item.name}-${index}`}
                      type="button"
                      onClick={onToggleCollapse}
                      title={item.name}
                      className={`
                        flex items-center justify-center px-0 py-2.5 rounded-lg transition-colors min-h-[40px] w-full touch-manipulation border-l-4 border-transparent
                        ${active ? 'bg-brand-gold/20 text-brand-gold border-brand-gold' : 'text-white/85 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <span className="text-lg font-semibold truncate w-6 text-center" style={{ fontSize: '0.7rem' }}>
                        {item.name.charAt(0)}
                      </span>
                    </button>
                  );
                }
                if (!item.path) return null;
                const isActive = isActivePath(item.path, pathname);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={item.name}
                    className={`
                      flex items-center justify-center px-0 py-2.5 rounded-lg transition-colors min-h-[40px] touch-manipulation border-l-4 border-transparent
                      ${isActive ? 'bg-brand-gold/20 text-brand-gold border-brand-gold' : 'text-white/85 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <span className="text-lg font-semibold truncate w-6 text-center" style={{ fontSize: '0.7rem' }}>
                      {item.name.charAt(0)}
                    </span>
                  </Link>
                );
              });
            })()
          : items.map((item, index) => {
              if (item.isSection) {
                return (
                  <div key={`section-${index}`} className="pt-4 pb-1.5 first:pt-0">
                    <span className="px-3 text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                      {item.name}
                    </span>
                  </div>
                );
              }
              if (item.children?.length) {
                const isOpen = groupOpen[item.name] ?? !item.defaultCollapsed;
                const active = anyChildActive(item.children, pathname);
                return (
                  <div key={`group-${item.name}-${index}`} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.name)}
                      className={`
                        flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors min-h-[40px] touch-manipulation border-l-4 text-left
                        ${active ? 'border-brand-gold text-white' : 'border-transparent text-white/85 hover:bg-white/10 hover:text-white'}
                      `}
                      aria-expanded={isOpen}
                      aria-label={isOpen ? `Recolher ${item.name}` : `Expandir ${item.name}`}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon && <span className="text-white/70">{item.icon}</span>}
                        {item.name}
                      </span>
                      <svg
                        className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="pl-3 space-y-0.5 border-l-2 border-white/10 ml-2">
                        {item.children.map((child) => {
                          if (!child.path) return null;
                          const isChildActive = isActivePath(child.path, pathname);
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`
                                flex items-center px-3 py-2 text-sm rounded-lg transition-colors min-h-[36px] touch-manipulation border-l-2
                                ${isChildActive
                                  ? 'bg-brand-gold/20 text-brand-gold border-brand-gold'
                                  : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white'}
                              `}
                            >
                              {child.icon && <span className="mr-2 text-white/60">{child.icon}</span>}
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              if (!item.path) return null;
              const isActive = isActivePath(item.path, pathname);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors min-h-[40px] touch-manipulation border-l-4
                    ${isActive
                      ? 'bg-brand-gold/20 text-brand-gold border-brand-gold'
                      : 'border-transparent text-white/85 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  {item.icon && <span className="mr-3 text-white/70">{item.icon}</span>}
                  {item.name}
                </Link>
              );
            })}
      </nav>
    </div>
  );

  return (
    <>
      {onMobileClose && mobileOpen && (
        <div
          role="button"
          tabIndex={-1}
          aria-label="Fechar menu"
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          bg-[#121212] border-r border-white/10 min-h-screen flex-shrink-0
          md:relative md:translate-x-0
          fixed inset-y-0 left-0 z-50 transform transition-[width,transform] duration-200 ease-out
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {navContent}
      </aside>
    </>
  );
}
