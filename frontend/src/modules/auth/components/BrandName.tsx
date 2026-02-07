/** Nome da marca: usa logo em imagem quando informado, senão fallback em HTML (ícone + texto) */

interface BrandNameProps {
  /** Tamanho: sm (header compacto), md (padrão), lg (destaque) */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar ícone de casas à esquerda (só quando não usa logoSrc) */
  showIcon?: boolean;
  /** Caminho do logo em imagem (ex: /logo.png). Quando informado, usa a imagem em vez do HTML. */
  logoSrc?: string;
  className?: string;
}

const sizeClasses = {
  sm: { wrap: 'gap-1.5', icons: 'w-5 h-5', img: 'h-8', line1: 'text-sm font-bold uppercase tracking-tight', line2: 'text-[10px] font-semibold uppercase tracking-wider' },
  md: { wrap: 'gap-2', icons: 'w-7 h-7', img: 'h-10', line1: 'text-lg font-bold uppercase tracking-tight', line2: 'text-xs font-semibold uppercase tracking-wider' },
  lg: { wrap: 'gap-3', icons: 'w-9 h-9', img: 'h-12', line1: 'text-xl font-bold uppercase tracking-tight', line2: 'text-sm font-semibold uppercase tracking-wider' },
};

function HouseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
    </svg>
  );
}

export function BrandName({ size = 'md', showIcon = true, logoSrc, className = '' }: BrandNameProps) {
  const s = sizeClasses[size];

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt="Saldão de Móveis Jerusalém"
        className={`${s.img} w-auto object-contain ${className}`}
        width={undefined}
        height={undefined}
      />
    );
  }

  return (
    <div className={`flex items-center text-brand-gold ${s.wrap} ${className}`}>
      {showIcon && (
        <span className={`${s.icons} flex flex-shrink-0 items-center gap-[2px]`} aria-hidden>
          <HouseIcon className="w-1/3 h-full" />
          <HouseIcon className="w-1/3 h-full" />
          <HouseIcon className="w-1/3 h-full" />
        </span>
      )}
      <div className="flex flex-col leading-tight">
        <span className={s.line1}>Saldão de Móveis</span>
        <span className={s.line2}>Jerusalém</span>
      </div>
    </div>
  );
}
