import bcrypt from 'bcryptjs'

/* Password hashing with bcrypt (pure JS — no native build step, runs on any
   host). Plain-text passwords are never stored or logged. The hash is
   self-describing (algorithm + cost + salt), so verify needs only the stored
   hash. Cost 12 is a sensible default for interactive logins. */

const COST = 12

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST)
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}
