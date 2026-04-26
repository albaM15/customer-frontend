import { Amplify } from 'aws-amplify';

const userPoolId = import.meta.env.user_pool_id;
const clientId = import.meta.env.frontend_client_id;
const region = userPoolId ? userPoolId.split('_')[0] : 'us-east-1';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId: clientId,
      // Optional settings if needed (e.g. login mechanisms)
      signUpVerificationMethod: 'code',
    }
  }
});
