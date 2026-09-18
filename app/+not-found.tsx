import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Catch-all route.
 *
 * Expo Router resolves its initial route from `location.pathname`, but the web
 * build can legitimately be hosted under any path — a preview URL, a
 * sub-directory, an embed. Anything the router cannot match lands on the front
 * door instead of a dead end, which makes the build portable without having to
 * know its base URL at export time.
 */
export default function NotFound() {
  return <Redirect href="/" />;
}
