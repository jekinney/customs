import type { Access, FieldAccess } from 'payload'

// Shared access helpers for the role-based model (admin / owner) described in
// Claude-docs/06-build-budget-and-parts.md. Enforced server-side by Payload.

type MaybeUser = { id?: string | number; role?: string } | null | undefined

export const isAdmin = (user: MaybeUser): boolean => user?.role === 'admin'

/** Collection-level: only signed-in users (admin or owner) may act. */
export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)

/** Collection-level: admins only. */
export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)

/** Field-level: admins only (e.g. reassigning a vehicle's owner). */
export const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdmin(user)

/**
 * Read access for owned + publishable content (vehicles):
 * - admin: everything
 * - signed-in owner: their own records + anything published (not draft)
 * - anonymous: published only (status != draft)
 */
export const readPublishedOrOwn: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true
  const published = { status: { not_equals: 'draft' } }
  if (user) {
    return { or: [published, { owner: { equals: user.id } }] }
  }
  return published
}

/**
 * Write access (create handled separately): admin everything, otherwise only
 * records the user owns (returns a Where constraint that scopes to owner).
 */
export const adminOrOwnerWrite: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return { owner: { equals: user.id } }
}

/**
 * Private owner-scoped access for the Garage Ledger (parts/invoices/maintenance):
 * NEVER public. Admin sees/does everything; an owner is scoped to records they own
 * (records carry an `owner` set from their vehicle). Anonymous: denied.
 */
export const privateOwnerAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return { owner: { equals: user.id } }
}
