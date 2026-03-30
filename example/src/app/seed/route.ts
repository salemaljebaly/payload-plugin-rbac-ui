import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * GET /seed
 * Sets the first user as superAdmin so you can access the admin panel on first run.
 * Remove or protect this route in production.
 */
export const GET = async () => {
  const payload = await getPayload({ config: configPromise })

  const { docs: users } = await payload.find({
    collection: 'users',
    limit: 1,
    sort: 'createdAt',
  })

  if (!users[0]) {
    return Response.json({ error: 'No users found. Create an account via /admin first.' }, { status: 404 })
  }

  const user = users[0]

  if ((user as any).superAdmin) {
    return Response.json({ message: 'Already seeded.', email: user.email })
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { superAdmin: true } as any,
    overrideAccess: true,
  })

  return Response.json({
    message: 'Done! Your account is now superAdmin. Log out and log back in.',
    email: user.email,
  })
}
