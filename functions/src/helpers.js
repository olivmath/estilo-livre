const { HttpsError } = require("firebase-functions/v2/https");

function requireAuth(request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required");
  return request.auth;
}

function requireAdminOrProf(request) {
  const auth = requireAuth(request);
  const role = auth.token?.role;
  if (role !== "admin" && role !== "professor")
    throw new HttpsError("permission-denied", "Admin or professor required");
  return auth;
}

function requireAdmin(request) {
  const auth = requireAuth(request);
  if (auth.token?.role !== "admin")
    throw new HttpsError("permission-denied", "Admin only");
  return auth;
}

module.exports = { requireAuth, requireAdminOrProf, requireAdmin };
