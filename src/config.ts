import dotenv from 'dotenv';
import Dashboard from 'supertokens-node/recipe/dashboard';
import Session from 'supertokens-node/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import UserRoles from 'supertokens-node/recipe/userroles';
import { TypeInput } from 'supertokens-node/types';

dotenv.config();

/* Configuration */
const applicationName = 'Top Films';

// Third party provider ids
const googleProviderId: string = 'google';
const twitterProviderId: string = 'twitter';
const discordProviderId: string = 'discord';

// Domains based on env
export const websiteDomain: string = process.env.FRONTEND_URL ?? 'http://localhost:3000';
export const apiDomain: string = process.env.AUTHENTICATION_API_URL ?? 'http://localhost:3001';
export const superTokensCoreUrl: string = process.env.SUPER_TOKENS_CORE_URL ?? 'http://localhost:3567';

// Configuration for super tokens
export const SuperTokensConfig: TypeInput = {
	supertokens: {
		connectionURI: superTokensCoreUrl,
		apiKey: process.env.SUPER_TOKENS_CORE_API_KEY
	},
	appInfo: {
		appName: applicationName,
		apiDomain,
		websiteDomain
	},
	recipeList: [
		ThirdPartyEmailPassword.init({
			providers: [
				{
					config: {
						thirdPartyId: googleProviderId,
						clients: [
							{
								clientId: process.env.GOOGLE_CLIENT_ID ?? '',
								clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
							}
						]
					}
				},
				{
					config: {
						thirdPartyId: twitterProviderId,
						clients: [
							{
								clientId: process.env.TWITTER_CLIENT_ID ?? '',
								clientSecret: process.env.TWITTER_CLIENT_SECRET ?? ''
							}
						]
					}
				},
				{
					config: {
						thirdPartyId: discordProviderId,
						clients: [
							{
								clientId: process.env.DISCORD_CLIENT_ID ?? '',
								clientSecret: process.env.DISCORD_CLIENT_SECRET ?? ''
							}
						]
					}
				}

			]
		}),
		// Use bearer token instead of cookies
		Session.init({
			getTokenTransferMethod: () => 'header'
		}),
		Dashboard.init(),
		UserRoles.init()
	]
};