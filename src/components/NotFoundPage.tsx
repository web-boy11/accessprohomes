import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Page not found</h1>
      <p className="mb-6">
        This page couldn’t be found. Let’s get you back home.
      </p>
      <Link to="/" className="underline">
        Back to AccessPro
      </Link>
    </main>
  )
}
