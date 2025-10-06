// Sample migrate-mongo migration (no-op placeholder)
//
// Purpose:
// This migration file is a safe placeholder used to verify the migrate-mongo
// toolchain and repository migration flow without making actual DB changes.
// Keep this file as a template/example for future migrations.
//
// Usage:
// - It will be executed by migrate-mongo during `up`/`down` runs but only logs
//   messages and performs no modifications. Replace or copy this file when
//   creating real migrations.
module.exports = {
  async up(db, client) {
    // Example: await db.collection('users').updateMany({}, { $set: { migratedAt: new Date() } });
    console.log('Running sample no-op up migration');
  },
  async down(db, client) {
    // Example rollback
    console.log('Reverting sample no-op down migration');
  }
};
