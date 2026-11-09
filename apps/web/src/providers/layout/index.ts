/**
 * Every frame a screen can sit in, one folder per kind: `shell` is the rail the signed-in app lives
 * inside, `auth` is the column the anonymous forms stand in. Both are here rather than in `pages`
 * because two screens share them and neither belongs to one.
 */
export * from './auth';
export * from './shell';
