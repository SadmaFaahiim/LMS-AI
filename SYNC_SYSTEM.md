# Subjects/Topics Sync System - Implementation Complete

## Overview

Successfully implemented a cron job-based synchronization system that fetches subjects, topics, and subtopics from the RAG API and caches them locally in PostgreSQL. This significantly reduces API calls and improves performance.

## Architecture

```
┌─────────────────┐      Sync (Cron)      ┌─────────────────┐
│   RAG API       │  ←───────────────────  │   LMS Backend   │
│ (Port 7001)     │   Every 5 minutes      │  (Sync Service) │
│ /api/taxonomy/  │   (configurable)       │  (Port 9000)    │
└─────────────────┘                        └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │  PostgreSQL DB  │
                                          │ (cached tables) │
                                          └─────────────────┘
                                                   ▲
                                                   │
                                          ┌─────────────────┐
                                          │  Frontend App   │
                                          │ (queries cache) │
                                          └─────────────────┘
```

## What Was Implemented

### 1. Database Schema ✅

**Created 3 new cached tables:**

- **cached_subjects** - Stores all subjects from RAG API
- **cached_topics** - Stores topics for each subject
- **cached_subtopics** - Stores subtopics for each subject/topic combination

**Features:**
- `is_active` flag to mark stale data
- `last_synced_at` timestamp for tracking freshness
- Unique constraints to prevent duplicates
- Performance indexes for fast queries

### 2. Sync Service ✅

**File:** [src/services/syncService.js](src/services/syncService.js)

**Methods:**
- `syncSubjects()` - Fetches all subjects from `/api/taxonomy/subjects`
- `syncTopicsForSubject(subject)` - Fetches topics from `/api/taxonomy/topics/:subject`
- `syncSubtopicsForTopic(subject, topic)` - Fetches subtopics from `/api/taxonomy/subtopics/:subject/:topic`
- `syncAll()` - Master sync that cascades through all levels
- `syncWithRetry()` - Automatic retry with configurable attempts

**Features:**
- Transaction-based upserts (mark inactive, then insert/update active)
- 30-second timeout for RAG API requests
- Comprehensive error logging
- Sync-in-progress flag to prevent concurrent syncs
- Continues on partial failures (e.g., if one subject fails, others still sync)

### 3. Scheduler ✅

**File:** [src/scheduler.js](src/scheduler.js)

**Features:**
- Uses `node-cron` for scheduled tasks
- Configurable interval via `SYNC_INTERVAL_MINUTES` (default: 5 minutes)
- Optional startup sync via `SYNC_ON_STARTUP` (default: true)
- Graceful shutdown handling (SIGTERM, SIGINT)
- Detailed logging of all operations

### 4. Updated Subject Controller ✅

**File:** [src/controllers/subjectController.js](src/controllers/subjectController.js)

**Changed 3 methods to query cached tables:**

1. `listSubjectsNames()` - Now queries `cached_subjects` table
2. `listTopicsBySubjectName()` - Now queries `cached_topics` table
3. `listSubtopicsByNames()` - Now queries `cached_subtopics` table

**API Response Enhancement:**
```json
{
  "success": true,
  "data": ["Physics", "Chemistry", "Mathematics"],
  "count": 3,
  "source": "cache",
  "last_synced_at": "2025-01-15T10:30:00.000Z"
}
```

### 5. Environment Configuration ✅

**File:** [.env](.env)

**New Variables:**
```env
# Sync Configuration
SYNC_ENABLED=true                    # Enable/disable sync
SYNC_INTERVAL_MINUTES=5              # How often to sync (5min, 60min, etc.)
SYNC_ON_STARTUP=true                 # Run sync when server starts
SYNC_RETRY_ATTEMPTS=3                # Number of retry attempts
SYNC_RETRY_DELAY_MS=5000             # Delay between retries (5 seconds)
```

### 6. Main Server Integration ✅

**File:** [src/index.js](src/index.js)

**Changes:**
- Imported scheduler module
- Initialize scheduler after server starts
- Added graceful shutdown handlers for SIGTERM and SIGINT
- Error handling for scheduler initialization

### 7. Dependencies ✅

**Installed:**
```bash
npm install node-cron
```

## How It Works

### Startup Flow

1. Server starts on port 9000
2. Scheduler initializes
3. If `SYNC_ON_STARTUP=true`, runs initial sync:
   - Fetches all subjects from RAG API
   - For each subject, fetches all topics
   - For each topic, fetches all subtopics
   - Stores everything in cached tables
4. Sets up cron job to run every N minutes

### Periodic Sync Flow

1. Cron job triggers at configured interval
2. Checks if sync is already in progress (prevents overlap)
3. Runs full sync cascade (subjects → topics → subtopics)
4. On success: Updates `last_synced_at` and `is_active` flags
5. On failure: Logs error, retries up to configured attempts
6. If all retries fail: Waits for next scheduled run

### API Query Flow

1. Frontend requests `/api/subjects`
2. Controller queries `cached_subjects` table
3. Returns data with `source: "cache"` and `last_synced_at`
4. No API call to RAG service!

## Benefits

✅ **Reduced API Load**: Only calls RAG API every 5 minutes instead of on every request
✅ **Better Performance**: Local PostgreSQL queries are much faster than HTTP requests
✅ **Offline Capability**: System works even if RAG API is temporarily down
✅ **No Breaking Changes**: Existing API endpoints unchanged (same response format)
✅ **Automatic Recovery**: Failed syncs retry automatically
✅ **Fresh Data**: Configurable sync intervals ensure data stays current
✅ **Graceful Degradation**: If RAG API is down, serves stale cached data

## Configuration Examples

### Development (Frequent Syncs)
```env
SYNC_ENABLED=true
SYNC_INTERVAL_MINUTES=5
SYNC_ON_STARTUP=true
```

### Production (Less Frequent)
```env
SYNC_ENABLED=true
SYNC_INTERVAL_MINUTES=60
SYNC_ON_STARTUP=true
```

### Testing (Disabled)
```env
SYNC_ENABLED=false
```

## Error Handling

The sync system handles errors gracefully:

1. **RAG API Down**: Logs error, retries, serves cached data
2. **Network Timeout**: 30-second timeout, then retry
3. **Invalid Response**: Logs error, continues with other subjects
4. **Database Errors**: Transaction rollback, error logged
5. **Concurrent Syncs**: Skips if sync already in progress

## Logging Examples

**Successful Sync:**
```
[Scheduler] Triggering scheduled sync...
[Sync] ==================== STARTING FULL SYNC ====================
[Sync] Starting subjects sync...
[Sync] Successfully synced 6 subjects
[Sync] Starting topics sync for subject: Physics...
[Sync] Successfully synced 15 topics for Physics
[Sync] Starting subtopics sync for Physics/Motion...
[Sync] Successfully synced 8 subtopics for Physics/Motion
[Sync] ==================== SYNC COMPLETED IN 2.45s ====================
[Sync] Summary: 6 subjects, 73 topics, 245 subtopics
```

**Failed Sync (RAG API Down):**
```
[Sync] Error syncing subjects: connect ECONNREFUSED 127.0.0.1:7001
[Sync] Attempt 1/3 failed: connect ECONNREFUSED
[Sync] Retrying in 5000ms...
[Scheduler] Startup sync failed: Will retry on next scheduled run
```

## Database Tables

### cached_subjects
```sql
CREATE TABLE cached_subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### cached_topics
```sql
CREATE TABLE cached_topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, subject)
);
```

### cached_subtopics
```sql
CREATE TABLE cached_subtopics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, subject, topic)
);
```

## API Endpoints (Unchanged)

All existing endpoints work exactly as before, just faster:

```
GET /api/subjects                          → Returns cached subjects
GET /api/subjects/:subject/topics          → Returns cached topics
GET /api/subjects/:subject/topics/:topic/subtopics → Returns cached subtopics
```

## Testing

To test the sync system:

1. **Start RAG API** (if available):
   ```bash
   # Make sure RAG API is running on port 7001
   curl http://localhost:7001/api/taxonomy/subjects
   ```

2. **Start LMS Server**:
   ```bash
   node src/index.js
   ```

3. **Watch Logs**:
   - Server starts on port 9000
   - Scheduler initializes
   - Startup sync runs automatically
   - Periodic sync runs every 5 minutes

4. **Test API**:
   ```bash
   # Should return cached data with source: "cache"
   curl http://localhost:9000/api/subjects
   ```

## Monitoring

To check sync status:

```bash
# Check when data was last synced
psql -U xeron -d lms_ai -c "SELECT name, last_synced_at FROM cached_subjects WHERE is_active = true;"

# Count cached items
psql -U xeron -d lms_ai -c "SELECT COUNT(*) FROM cached_subjects WHERE is_active = true;"
psql -U xeron -d lms_ai -c "SELECT COUNT(*) FROM cached_topics WHERE is_active = true;"
psql -U xeron -d lms_ai -c "SELECT COUNT(*) FROM cached_subtopics WHERE is_active = true;"
```

## Future Enhancements (Optional)

Possible improvements for later:

1. **Manual Sync Trigger**: Add API endpoint to trigger sync on demand
2. **Sync Status API**: Add endpoint to check last sync time and status
3. **Differential Sync**: Only sync changed items instead of full refresh
4. **Webhook Trigger**: RAG API could notify LMS when data changes
5. **Metrics**: Track sync duration, success rate, API call counts
6. **Alerting**: Send alerts if sync fails repeatedly

## Files Modified

- [schema.sql](schema.sql) - Added 3 cached tables
- [src/services/syncService.js](src/services/syncService.js) - NEW - Sync logic
- [src/scheduler.js](src/scheduler.js) - NEW - Cron job scheduler
- [src/controllers/subjectController.js](src/controllers/subjectController.js) - Updated to query cache
- [src/index.js](src/index.js) - Integrated scheduler
- [.env](.env) - Added sync configuration
- [package.json](package.json) - Added node-cron dependency

## Conclusion

The cron job-based sync system is fully implemented and operational. It provides a robust, performant way to keep subjects/topics/subtopics synchronized with the RAG API while significantly reducing API load and improving response times.
