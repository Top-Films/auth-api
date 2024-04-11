import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import supertokens from 'supertokens-node';
import { errorHandler, middleware } from 'supertokens-node/framework/express';
import Multitenancy from 'supertokens-node/recipe/multitenancy';
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
app.get('/tenants', async (_req, res) => {
	const tenants = await Multitenancy.listAllTenants();
	res.send(tenants);
});

// Health check
app.get('/health', async (_req, res) => {
	res.send({ status: 'UP' });
});

// Super Tokens error handling
app.use(errorHandler());

// Start API
app.listen(port, host, () => console.log(`API Server listening on port ${port}`));
