import { useState, useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';

const BANNER_SLIDES = [
  {
    title: 'Gestão de estoque',
    description:
      'Revenda, insumos e produtos fabricados gerenciados em um só lugar com eficiência e clareza.',
    image: '/banner-estoque.jpg',
  },
  {
    title: 'Compras e produção',
    description:
      'Controle de compras, lista de materiais (BOM) e ordens de produção integrados ao estoque.',
    image: '/banner-compras.jpg',
  },
  {
    title: 'Vendas e entregas',
    description:
      'Pedidos de venda, baixa de estoque e roteirização de entregas em um fluxo único.',
    image: '/banner-vendas.jpg',
  },
  {
    title: 'Financeiro',
    description:
      'Contas a pagar e a receber de forma simples, com visão do fluxo de caixa.',
    image: '/banner-financeiro.jpg',
  },
];

const ROTATE_INTERVAL_MS = 6000;

export function LoginPage() {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setSlideIndex((i) => (i + 1) % BANNER_SLIDES.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  const slide = BANNER_SLIDES[slideIndex];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans p-4">
      <div className="w-full max-w-[1000px] h-auto min-h-[500px] lg:h-[650px] flex flex-col lg:flex-row bg-[#121212] rounded-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
        {/* Banner carrossel (esquerda) */}
        <div
          className="flex-[1.2] flex flex-col justify-end min-h-[300px] p-8 sm:p-10 lg:p-12 bg-cover bg-center relative transition-[background-image] duration-700"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), #121212), url(${slide.image})`,
          }}
        >
          <div className="transition-opacity duration-500">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              {slide.title}
            </h1>
            <p className="text-base text-[#b0b0b0] leading-relaxed max-w-[80%]">
              {slide.description}
            </p>
            <div className="flex gap-2.5 mt-8 items-center">
              {BANNER_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir para slide ${i + 1}: ${BANNER_SLIDES[i].title}`}
                  onClick={() => setSlideIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === slideIndex
                      ? 'w-6 bg-brand-gold'
                      : 'w-1.5 bg-[#444] hover:bg-[#555]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Login (direita): em volta do logo = mesmo preto do logo; de "Sistema de gestão" para baixo = preto mais claro */}
        <div className="flex-1 flex flex-col border-t lg:border-t-0 lg:border-l border-[#222]">
          {/* Só o logo em cima do preto do logo — sem recorte */}
          <div className="bg-black flex-shrink-0 py-4 sm:py-5 px-6 sm:px-10 lg:px-14 text-center">
            <img
              src="/logo.png"
              alt="Saldão de Móveis Jerusalém"
              className="w-[180px] sm:w-[200px] h-auto object-contain mx-auto"
            />
          </div>
          {/* De "Sistema de gestão" para baixo = preto mais claro */}
          <div className="flex-1 flex flex-col justify-center bg-[#121212] p-6 sm:p-10 lg:p-14">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-lg font-semibold text-white">Sistema de gestão</h2>
              <p className="text-sm text-[#666] mt-1">Faça login para continuar</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
