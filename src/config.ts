import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import Session from 'supertokens-node/recipe/session';
import { TypeInput } from 'supertokens-node/types';
import Dashboard from 'supertokens-node/recipe/dashboard';
import UserRoles from 'supertokens-node/recipe/userroles';
import dotenv from 'dotenv'; 

dotenv.config();

const applicationName = 'Top Films';

const googleProviderId: string = 'google';
const githubProviderId: string = 'github';
const discordProviderId: string = 'discord';

const apiDomain: string = process.env.AUTHENTICATION_API_URL ?? 'http://localhost:3001';
const superTokensCoreUrl: string = process.env.SUPER_TOKENS_CORE_URL ?? 'http://localhost:3567';

export const websiteDomain: string = process.env.FRONTEND_URL ?? 'http://localhost:3000';

export const SuperTokensConfig: TypeInput = {
	supertokens: {
		connectionURI: superTokensCoreUrl
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
						thirdPartyId: githubProviderId,
						clients: [
							{
								clientId: process.env.GITHUB_CLIENT_ID ?? '',
								clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ''
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
		Session.init(),
		Dashboard.init(),
		UserRoles.init()
	]
};
