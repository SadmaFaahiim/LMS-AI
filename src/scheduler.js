const cron = require('node-cron');
const syncService = require('./services/syncService');

class Scheduler {
    constructor() {
        this.tasks = [];
    }

    /**
     * Initialize all scheduled tasks
     */
    initialize() {
        const syncEnabled = process.env.SYNC_ENABLED === 'true';
        const syncInterval = process.env.SYNC_INTERVAL_MINUTES || '5';
        const syncOnStartup = process.env.SYNC_ON_STARTUP === 'true';

        if (!syncEnabled) {
            console.log('[Scheduler] Sync is disabled via SYNC_ENABLED');
            return;
        }

        // Schedule periodic sync
        // Cron pattern: */X * * * * = Every X minutes
        const cronPattern = `*/${syncInterval} * * * *`;

        const syncTask = cron.schedule(cronPattern, async () => {
            console.log('[Scheduler] Triggering scheduled sync...');
            try {
                await syncService.syncWithRetry();
            } catch (error) {
                console.error('[Scheduler] Scheduled sync failed:', error.message);
            }
        }, {
            scheduled: false // Don't start immediately
        });

        this.tasks.push({ name: 'sync', task: syncTask });
        console.log(`[Scheduler] Scheduled sync task to run every ${syncInterval} minutes`);

        // Start all tasks
        this.tasks.forEach(({ task }) => task.start());

        // Run on startup if configured
        if (syncOnStartup) {
            this.runStartupSync();
        }
    }

    /**
     * Run initial sync on server startup
     */
    async runStartupSync() {
        console.log('[Scheduler] Running startup sync...');
        try {
            await syncService.syncWithRetry();
        } catch (error) {
            console.error('[Scheduler] Startup sync failed:', error.message);
            console.log('[Scheduler] Will retry on next scheduled run');
        }
    }

    /**
     * Stop all scheduled tasks
     */
    shutdown() {
        console.log('[Scheduler] Stopping all scheduled tasks...');
        this.tasks.forEach(({ name, task }) => {
            task.stop();
            console.log(`[Scheduler] Stopped task: ${name}`);
        });
        this.tasks = [];
    }
}

module.exports = new Scheduler();
