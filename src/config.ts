import dotenv from 'dotenv';
import supertokens from 'supertokens-node';
import Dashboard from 'supertokens-node/recipe/dashboard';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { SMTPService as PasswordResetSMTPService } from 'supertokens-node/recipe/emailpassword/emaildelivery';
import EmailVerification from 'supertokens-node/recipe/emailverification';
import { SMTPService as EmailVerificationSMTPService } from 'supertokens-node/recipe/emailverification/emaildelivery';
import Session from 'supertokens-node/recipe/session';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import UserRoles from 'supertokens-node/recipe/userroles';
import { TypeInput } from 'supertokens-node/types';

dotenv.config();

/* Configuration */
const applicationName = 'Top Films';

// Third party provider ids
const googleProviderId: string = 'google';
const githubProviderId: string = 'github';
const discordProviderId: string = 'discord';

// Domains based on env
export const websiteDomain: string = process.env.FRONTEND_URL ?? 'http://localhost:3000';
export const apiDomain: string = process.env.AUTHENTICATION_API_URL ?? 'http://localhost:3001';
export const superTokensCoreUrl: string = process.env.SUPER_TOKENS_CORE_URL ?? 'http://localhost:3567';

// Error message for duplicate third party emails
const duplicateEmailErrorMessage: string = 'Email already exists with different login method';

const emailConfig = {
	smtpSettings: {
		host: 'smtppro.zoho.com',
		password: process.env.EMAIL_PASSWORD ?? '',
		port: 465,
		from: {
			name: 'Top Films',
			email: 'no-reply@topfilms.io'
		},
		secure: true
	}
};

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
		EmailPassword.init({
			emailDelivery: {
				service: new PasswordResetSMTPService(emailConfig)
			},
			override: {
				functions(originalImplementation) {
					return {
						...originalImplementation,
						async signUp(input) {
							const existingUsers = await supertokens.listUsersByAccountInfo(input.tenantId, {
								email: input.email
							});

							if (existingUsers.length === 0) {
								return originalImplementation.signUp(input);
							}

							return { status: 'EMAIL_ALREADY_EXISTS_ERROR' };
						}
					};
				}
			}
		}),
		ThirdParty.init({
			signInAndUpFeature: {
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
			},
			override: {
				functions(originalImplementation) {
					return {
						...originalImplementation,
						async signInUp(input) {
							const existingUsers = await supertokens.listUsersByAccountInfo(input.tenantId, {
								email: input.email
							});

							// This email is new so we allow sign up
							if (existingUsers.length === 0) {
								// Sign in/up
								const response = await originalImplementation.signInUp(input);

								// Add USER role
								if (response.status === 'OK') {
									await UserRoles.addRoleToUser('public', response.user.id, 'USER');
								}
							}

							// Trying to sign in with the same social login. So we allow it
							if (existingUsers.find(u =>
								u.loginMethods.find(lM => lM.hasSameThirdPartyInfoAs({
									id: input.thirdPartyId,
									userId: input.thirdPartyUserId
								}) && lM.recipeId === 'thirdparty') !== undefined)) {
								return originalImplementation.signInUp(input);
							}

							// The email already exists with another social or email password login method, so we throw an error.
							throw new Error(duplicateEmailErrorMessage);
						}
					};
				},
				apis(originalImplementation) {
					return {
						...originalImplementation,
						async signInUpPOST(input) {
							try {
								return await originalImplementation.signInUpPOST!(input);
							} catch (err: unknown) {
								if (err instanceof Error && err.message === duplicateEmailErrorMessage) {
									return {
										status: 'GENERAL_ERROR',
										message: duplicateEmailErrorMessage
									};
								}

								throw err;
							}
						}
					};
				}
			}
		}),
		// Use bearer token instead of cookies
		Session.init({
			getTokenTransferMethod: () => 'header'
		}),
		EmailVerification.init({
			mode: 'REQUIRED',
			emailDelivery: {
				service: new EmailVerificationSMTPService(emailConfig)
			}
		}),
		Dashboard.init(),
		UserRoles.init()
	]
};