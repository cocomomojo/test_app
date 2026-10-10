export const login = async (username, password) => {
  const cognitoEndpoint = import.meta.env.VITE_COGNITO_ENDPOINT;

  // If Cognito endpoint is configured, use Cognito (production). Otherwise fall back to local API.
  if (cognitoEndpoint) {
    const body = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    const res = await fetch(`${cognitoEndpoint}/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-amz-json-1.1", "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const data = await res.json();
    return data.AuthenticationResult.IdToken;
  }

  // local fallback: call backend public login
  const apiBase = import.meta.env.VITE_API_BASE || "";
  const res = await fetch(`${apiBase}/public/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();
  return data.idToken;
};