// Sample migrate-mongo migration (no-op placeholder)
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
