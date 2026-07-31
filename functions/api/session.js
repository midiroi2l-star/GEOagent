import { isAdminRequest } from '../_utils/auth.js';
import { json } from '../_utils/events.js';

export async function onRequestGet({ request, env }) {
  const authenticated = await isAdminRequest(request, env);
  return json({ authenticated });
}
