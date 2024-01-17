import express from 'express';
import cors from 'cors';
import supertokens from 'supertokens-node';
import { middleware, errorHandler } from 'supertokens-node/framework/express';
import Multitenancy from 'supertokens-node/recipe/multitenancy';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import Session from 'supertokens-node/recipe/session';
import { TypeInput } from 'supertokens-node/types';
import Dashboard from 'supertokens-node/recipe/dashboard';
import UserRoles from 'supertokens-node/recipe/userroles';
import dotenv from 'dotenv'; 

dotenv.config();

/* Configuration */
const applicationName = 'Top Films';

// Third party provider ids
const googleProviderId: string = 'google';
const twitterProviderId: string = 'twitter';
const discordProviderId: string = 'discord';

// Domains based on env
const apiDomain: string = process.env.AUTHENTICATION_API_URL ?? 'http://localhost:3001';
const superTokensCoreUrl: string = process.env.SUPER_TOKENS_CORE_URL ?? 'http://localhost:3567';
const websiteDomain: string = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// Debug logs for env
console.log(`Auth API Domain: ${apiDomain}`);
console.log(`Super Tokens Domain: ${superTokensCoreUrl}`);
console.log(`Frontend Domain: ${websiteDomain}`);

// Configuration for super tokens
const SuperTokensConfig: TypeInput = {
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

// Initialize super tokens
supertokens.init(SuperTokensConfig);

/* API */
const port: number = process.env.AUTHENTICATION_API_PORT as number | undefined ?? 3001;
const host: string = '0.0.0.0';
const app = express();

// Cors settings
app.use(
	cors({
		origin: websiteDomain, 
		allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
		methods: ['GET', 'PUT', 'POST', 'DELETE'],
		credentials: true
	})
);

// Expose super tokens endpoints
app.use(middleware());

// Create the tenants drop down when the app loads
app.get('/tenants', async (_req, res) => {
	const tenants = await Multitenancy.listAllTenants();
	res.send(tenants);
});

// Super Tokens error handling
app.use(errorHandler());

// Start API
app.listen(port, host, () => console.log(`API Server listening on port ${port}`));
