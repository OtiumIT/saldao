export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 mt-auto">
      <div className="px-6">
        <div className="flex justify-center items-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Saldão de Móveis Jerusalém. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
