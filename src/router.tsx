import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: () => (
      <main className="center-page">
        <h1>A small interruption.</h1>
        <p>We couldn’t load this page. Please try again in a moment.</p>
        <a className="button primary" href="/">
          Return to AccessPro
        </a>
      </main>
    ),
    defaultPreloadStaleTime: 0,
  })

  return router
}
