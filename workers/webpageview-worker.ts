import { connect, JSONCodec, type Subscription } from 'nats';
import { chromium } from 'playwright';
import packageJSON from '../package.json';
interface ScrapeJob {
	id: string;
	url: string;
	selector?: string;
	waitForSelector?: string;
	timeout: number;
	priority: 'high' | 'medium' | 'low';
	createdAt: string;
}

const jc = JSONCodec();

async function startWorkerService() {
	console.log('Starting scraper worker service...');

	try {
		const nc = await connect({ servers: process.env.NATS_URL || 'nats://localhost:4222' });
		console.log('Connected to NATS');

		const service = await nc.services.add({
			name: packageJSON.name,
			version: packageJSON.version,
		});

		// Subscribe to all priority queues
		const subscriptions: Subscription[] = [
			nc.subscribe('scrape-high', { queue: 'scrapers' }),
			nc.subscribe('scrape-medium', { queue: 'scrapers' }),
			nc.subscribe('scrape-low', { queue: 'scrapers' }),
		];

		console.log('Subscribed to scrape queues');

		// Process messages from all subscriptions
		for (const sub of subscriptions) {
			processSubscription(sub, nc);
		}

		// Handle graceful shutdown
		process.on('SIGINT', async () => {
			console.log('Shutting down worker...');
			for (const sub of subscriptions) {
				sub.unsubscribe();
			}
			await service.stop();
			await nc.drain();
			process.exit(0);
		});
	} catch (error) {
		console.error('Failed to start worker service:', error);
		process.exit(1);
	}
}

async function processSubscription(subscription: Subscription, nc: any) {
	for await (const msg of subscription) {
		try {
			const jobData = jc.decode(msg.data) as ScrapeJob;
			console.log(
				`[${new Date().toISOString()}] Processing job ${jobData.id} (${jobData.priority}): ${jobData.url}`,
			);

			// Process the scraping job
			const result = await scrapeWebsite(jobData);

			// Publish the result
			nc.publish(`scrape.result.${jobData.id}`, jc.encode(result));

			console.log(`[${new Date().toISOString()}] Completed job ${jobData.id}`);

			// Acknowledge the message
			msg.respond(jc.encode({ success: true, jobId: jobData.id }));
		} catch (error) {
			console.error('Error processing message:', error);
			// In a production system, you might want to implement retry logic
			// or move failed jobs to a dead letter queue
		}
	}
}

async function scrapeWebsite(job: ScrapeJob): Promise<any> {
	const browser = await chromium.launch();

	try {
		console.log(`[${job.id}] Launching browser for ${job.url}`);
		const context = await browser.newContext();
		const page = await context.newPage();

		// Set a reasonable viewport
		await page.setViewportSize({ width: 1280, height: 800 });

		// Set timeout based on job priority
		const navigationTimeout = job.timeout;
		page.setDefaultTimeout(navigationTimeout);

		// Navigate to the URL
		console.log(`[${job.id}] Navigating to ${job.url}`);
		await page.goto(job.url, { waitUntil: 'networkidle' });

		// Wait for specific selector if provided
		if (job.waitForSelector) {
			console.log(`[${job.id}] Waiting for selector: ${job.waitForSelector}`);
			await page.waitForSelector(job.waitForSelector, { timeout: navigationTimeout });
		}

		// Extract content based on selector or get full HTML
		let content;
		if (job.selector) {
			console.log(`[${job.id}] Extracting content with selector: ${job.selector}`);
			content = await page.$$eval(job.selector, elements =>
				elements.map(el => ({
					text: el.textContent?.trim(),
					html: el.innerHTML,
					outerHtml: el.outerHTML,
				})),
			);
		} else {
			console.log(`[${job.id}] Extracting full page content`);
			content = await page.content();
		}

		// Take a screenshot
		const screenshot = await page.screenshot({ type: 'png' });

		return {
			jobId: job.id,
			url: job.url,
			content,
			screenshot,
			timestamp: new Date().toISOString(),
		};
	} finally {
		await browser.close();
	}
}

startWorkerService().catch(console.error);
