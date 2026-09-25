import { Router } from 'express'
import { authRouter } from './auth.js'
import { contentRouter } from './content.js'
import { taxonomyRouter } from './taxonomy.js'
import { authorsRouter } from './authors.js'
import { usersRouter } from './users.js'
import { mediaRouter } from './media.js'
import { siteRouter } from './site.js'
import { activityRouter, collectionsRouter, redirectsRouter } from './misc.js'
import { adminIntegrationsRouter, integrationsRenderRouter } from './integrations.js'

/* Mounts every /api sub-router. Auth state (req.user) is already attached by
   the time these run; individual routes decide what requires authentication. */

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/content', contentRouter)
apiRouter.use('/taxonomy', taxonomyRouter)
apiRouter.use('/authors', authorsRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/media', mediaRouter)
apiRouter.use('/site', siteRouter)
apiRouter.use('/collections', collectionsRouter)
apiRouter.use('/redirects', redirectsRouter)
apiRouter.use('/activity', activityRouter)
apiRouter.use('/admin/site-integrations', adminIntegrationsRouter)
apiRouter.use('/site-integrations', integrationsRenderRouter)
