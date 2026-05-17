export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          Admin
        </h1>
        <form action="/api/admin/auth" method="POST" className="space-y-4">
          <div>
            <label
              htmlFor="token"
              className="mb-1.5 block text-sm text-[var(--color-text-muted)]"
            >
              Password
            </label>
            <input
              id="token"
              name="token"
              type="password"
              autoFocus
              autoComplete="current-password"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 font-mono text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
