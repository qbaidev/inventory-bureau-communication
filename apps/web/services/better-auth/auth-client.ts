import { createAuthClient } from "better-auth/react"
import { getAuthUrl } from "./lib/utils"

export const authClient = createAuthClient({
  baseURL: getAuthUrl(),
}) as ReturnType<typeof createAuthClient>
