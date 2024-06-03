import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import supertokens, { deleteUser } from 'supertokens-node';
import { SessionRequest, errorHandler, middleware } from 'supertokens-node/framework/express';
import { EmailVerificationClaim } from 'supertokens-node/recipe/emailverification';
import Multitenancy from 'supertokens-node/recipe/multitenancy';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { SuperTokensConfig, apiDomain, superTokensCoreUrl, websiteDomain } from './config';

dotenv.config();

// Debug logs for env
console.log(`Auth API Domain: ${apiDomain}`);
console.log(`Super Tokens Domain: ${superTokensCoreUrl}`);
console.log(`Frontend Domain: ${websiteDomain}`);

// Initialize super tokens
supertokens.init(SuperTokensConfig);

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
app.get('/tenants', async (_, res) => {
	const tenants = await Multitenancy.listAllTenants();
	res.send(tenants);
});

// Delete user
app.delete(
	'/user/:userId', 
	verifySession({
		overrideGlobalClaimValidators: async globalValidators => globalValidators.filter(v => v.id !== EmailVerificationClaim.key)
	}),
	async (req: SessionRequest, res) => {
		if (req.params.userId !== req.session!.getUserId()) {
			res.sendStatus(403);
		}

		await deleteUser(req.params.userId);
		res.sendStatus(200);
	}
);

// Health check
app.get('/health', async (_, res) => {
	res.send({ status: 'UP' });
});

// Super Tokens error handling
app.use(errorHandler());

// Start API
app.listen(port, host, () => console.log(`API Server listening on port ${port}`));
