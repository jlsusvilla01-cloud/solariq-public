const DB_LATENCY_MS = 50;

// Simulate a database fetch query that takes ~50ms
function mockDbFetch(queryName: string): Promise<string> {
    return new Promise(resolve => {
        setTimeout(() => resolve(`Result from ${queryName}`), DB_LATENCY_MS);
    });
}

// Emulate original GET /api/track/:token sequential fetching
async function runSequential() {
    console.time('Sequential Fetch');
    const ms = await mockDbFetch('milestones');
    const upd = await mockDbFetch('updates');
    const photos = await mockDbFetch('photos');
    const sigs = await mockDbFetch('signatures');
    const qts = await mockDbFetch('quotations');
    const docs = await mockDbFetch('documents');
    const pays = await mockDbFetch('payments');
    console.timeEnd('Sequential Fetch');
}

// Emulate refactored GET /api/track/:token concurrent fetching
async function runConcurrent() {
    console.time('Concurrent Fetch');
    const [ms, upd, photos, sigs, qts, docs, pays] = await Promise.all([
        mockDbFetch('milestones'),
        mockDbFetch('updates'),
        mockDbFetch('photos'),
        mockDbFetch('signatures'),
        mockDbFetch('quotations'),
        mockDbFetch('documents'),
        mockDbFetch('payments')
    ]);
    console.timeEnd('Concurrent Fetch');
}

async function benchmark() {
    console.log(`Simulating DB latency of ${DB_LATENCY_MS}ms per query...`);
    console.log('---');
    await runSequential();
    console.log('---');
    await runConcurrent();
}

benchmark().catch(console.error);
