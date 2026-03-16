const setupDb = require('./db');
(async () => {
    try {
        const db = await setupDb();
        const row = await db.get('SELECT * FROM app_settings WHERE key = "manager_password"');
        console.log('Stored Password Hash:', row ? row.value : 'NOT FOUND');
    } catch (err) {
        console.error('Error:', err);
    }
})();
