// src/authConfig.ts
export const msalConfig = {
  auth: {
    clientId: "956e10a2-3a81-4fe5-9b7a-d2295da0a192",
    authority: "https://login.microsoftonline.com/ec9ef439-ba6e-48ca-8428-b8a612dd7b64",
    redirectUri: "https://sam.slt.lk/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read", "api://6016f38e-7b98-48c6-8fd9-1c2fbc6f41b1/access_as_user"]
};