// Shared cookie attributes for the auth cookies.
// sameSite "None" lets the Frontend and Dashboard send the cookie to the API
// even though they live on different domains. Browsers only accept a
// SameSite=None cookie when it is also Secure, so both are required here.
export const cookieOptions = {
    httpOnly: true,
    sameSite: "None",
    secure: true,
};
