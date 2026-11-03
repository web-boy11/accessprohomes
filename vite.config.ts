import { defineConfig, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

function localDevFunctions(): Plugin {
  return {
    name: 'local-dev-functions',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/.netlify/functions/register')) {
          try {
            const mod = await server.ssrLoadModule('/netlify/functions/register.mts')
            const chunks: Buffer[] = []
            for await (const chunk of req) chunks.push(chunk)
            const body = Buffer.concat(chunks)
            const proto = (req.headers['x-forwarded-proto'] as string) || 'http'
            const fullUrl = `${proto}://${req.headers.host || 'localhost:3000'}${req.url}`
            const webReq = new Request(fullUrl, {
              method: req.method,
              headers: req.headers as HeadersInit,
              body: ['GET', 'HEAD'].includes(req.method || 'GET') ? undefined : body,
            })
            const webRes = await mod.default(webReq)
            res.statusCode = webRes.status
            webRes.headers.forEach((val: string, key: string) => res.setHeader(key, val))
            const resBody = Buffer.from(await webRes.arrayBuffer())
            res.end(resBody)
          } catch (err: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err?.message || 'Local function error' }))
          }
          return
        }
        next()
      })
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    allowedHosts: true,
  },
  plugins: [
    tailwindcss(),
    localDevFunctions(),
    netlify({
      dev: {
        functions: { enabled: false },
        edgeFunctions: { enabled: false },
      },
    }),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
