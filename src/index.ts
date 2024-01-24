import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import supertokens from 'supertokens-node';
import { errorHandler, middleware } from 'supertokens-node/framework/express';
import Multitenancy from 'supertokens-node/recipe/multitenancy';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import { SuperTokensConfig, apiDomain, superTokensCoreUrl, websiteDomain } from './config';

import bodyParser = require('body-parser');

dotenv.config();

// Debug logs for env
console.log(`Auth API Domain: ${apiDomain}`);
console.log(`Super Tokens Domain: ${superTokensCoreUrl}`);
console.log(`Frontend Domain: ${websiteDomain}`);

// Initialize super tokens
supertokens.init(SuperTokensConfig);

/* API */
const port: number = process.env.AUTHENTICATION_API_PORT as number | undefined ?? 3001;
const host: string = '0.0.0.0';
const app = express();
const jsonParser = bodyParser.json();

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

// Update user metadata with first and last name
app.post('/user', verifySession(), jsonParser, async (req, res) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const session = req.session;
	const userId = session.getUserId();
	await UserMetadata.updateUserMetadata(userId, {
		// eslint-disable-next-line camelcase
		first_name: req.body.first_name,
		// eslint-disable-next-line camelcase
		last_name: req.body.last_name
	});
	res.json({ message: 'Successfully updated user metadata' });
});

// Get user first and last name from metadata
app.get('/user', verifySession(), async (req, res) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const session = req.session;
	const userId = session.getUserId();
	const metadata = (await UserMetadata.getUserMetadata(userId)).metadata;
	res.json({
		// eslint-disable-next-line camelcase
		first_name: metadata.first_name,
		// eslint-disable-next-line camelcase
		last_name: metadata.last_name
	});
});

// Super Tokens error handling
app.use(errorHandler());

// Start API
app.listen(port, host, () => console.log(`API Server listening on port ${port}`));
