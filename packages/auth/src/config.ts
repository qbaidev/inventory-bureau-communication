import { createEnv } from "@t3-oss/env-core"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { openAPI } from "better-auth/plugins"
import { z } from "zod"

import { createDBClient } from "@repo/db/client"
import { accounts, sessions, users, verifications } from "@repo/db/schema"

export const authEnv = createEnv({
	server: {
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_TRUSTED_ORIGINS: z.string(),
		BETTER_AUTH_COOKIE_DOMAIN: z.string().optional(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_SECRET: z.string().optional(),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
})

export const AUTH_BASE_PATH = "/auth"

export function createAuth(): ReturnType<typeof betterAuth> {
	const db = createDBClient()

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			schema: {
				users,
				sessions,
				accounts,
				verifications,
			},
			usePlural: true,
		}),
		basePath: AUTH_BASE_PATH,
		secret: authEnv.BETTER_AUTH_SECRET,
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		socialProviders: {
			google: {
				prompt: "select_account",
				clientId: authEnv.GOOGLE_CLIENT_ID as string,
				clientSecret: authEnv.GOOGLE_CLIENT_SECRET as string,
			},
		},
		trustedOrigins: authEnv.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? [],
		user: {
			additionalFields: {
				role: {
					type: "string",
					defaultValue: "end_user",
					input: true,
				},
			},
		},
		advanced: {
			...(authEnv.BETTER_AUTH_COOKIE_DOMAIN && {
				crossSubDomainCookies: {
					enabled: true,
					domain: authEnv.BETTER_AUTH_COOKIE_DOMAIN,
				},
			}),
		},
		plugins: [
			openAPI({
				path: "/reference",
			}),
		],
	})
}

let _auth: ReturnType<typeof betterAuth> | null = null

export function clearAuthCache(): void {
	_auth = null
}

export function getAuth(): ReturnType<typeof betterAuth> {
	if (!_auth) {
		_auth = createAuth()
	}
	return _auth!
}

export type Session = ReturnType<typeof getAuth>["$Infer"]["Session"]
