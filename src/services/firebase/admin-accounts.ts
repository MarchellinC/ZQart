// Client-side allowlist for local SQLite administration in this prototype.
// Never use it as authorization for Firestore writes; enforce those in Security Rules.
export const LOCAL_ADMIN_UIDS = new Set([
  'Il06ZJBoUMetSnXX1VGjvN5KxSA3',
]);
