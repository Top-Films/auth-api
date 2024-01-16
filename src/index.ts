import express from 'express';
import cors from 'cors';
import supertokens from 'supertokens-node';
import { middleware, errorHandler } from 'supertokens-node/framework/express';
import { websiteDomain, SuperTokensConfig } from './config';
import Multitenancy from 'supertokens-node/recipe/multitenancy';
import dotenv from 'dotenv'; 

dotenv.config();

supertokens.init(SuperTokensConfig);

const port: number = process.env.AUTHENTICATION_API_PORT as number | undefined ?? 3001;
const host: string = '0.0.0.0';
const app = express();

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
