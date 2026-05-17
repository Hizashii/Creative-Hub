export function AuthMediaPanel() {
  return (
    <aside className="relative hidden overflow-hidden border-l border-outline-variant bg-surface-container-low lg:block lg:w-1/2">
      <img
        src="/background.png"
        alt="Creative Hub project workspace preview"
        className="h-full min-h-screen w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-lowest/25 via-transparent to-transparent" />
    </aside>
  );
}
