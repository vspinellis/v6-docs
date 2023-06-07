/*
|--------------------------------------------------------------------------
| Development server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

import 'reflect-metadata'
import { Ignitor } from '@adonisjs/core'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

/**
 * Defining routes for development server
 */
async function defineRoutes() {
  const { collections } = await import('#src/collections')
  const { default: router } = await import('@adonisjs/core/services/router')

  router.get('*', async ({ request, response }) => {
    for (let collection of collections) {
      await collection.refresh()
      const entry = collection.findByPermalink(request.url())
      if (entry) {
        return entry.render({ collection, entry })
      }
    }

    return response.notFound('Page not found')
  })
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap(app => {
    app.initiating(() => {
      app.useConfig({
        app: {
          appKey: 'zKXHe-Ahdb7aPK1ylAJlRgTefktEaACi',
          http: {},
        },
        logger: {
          default: 'app',
          loggers: {
            app: {
              enabled: true
            },
          },
        },
        views: {
          cache: false,
        }
      })
    })

    app.starting(defineRoutes)
  })
  .httpServer()
  .start()
  .catch(console.error)