import { SELF } from "cloudflare:test";
import { expect, test, describe } from "vitest";

describe("Crawler and Seeding Integration Tests", () => {
	test("POST /content/seed - should seed categories", async () => {
		const res = await SELF.fetch("http://local.test/content/seed", {
			method: "POST",
		});

		const body = await res.json() as any;
		if (res.status !== 200) {
			console.error("Seeding failed:", body);
		}
		expect(res.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.message).toBe("Database seeded successfully");
	});

	test("POST /content/seed - should skip seeding if already exists", async () => {
		// First call happens in the previous test (if they share state) 
		// but vitest cloudflare pool often resets state or has shared state depending on config.
		// Let's assume they might not share state, so we call it again.
		
		// Ensure it's seeded
		await SELF.fetch("http://local.test/content/seed", {
			method: "POST",
		});

		// Second call
		const res = await SELF.fetch("http://local.test/content/seed", {
			method: "POST",
		});

		const body = await res.json() as any;
		expect(res.status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.message).toBe("Database already seeded");
	});

	test("POST /content/crawler - should crawl questions", async () => {
		const res = await SELF.fetch("http://local.test/content/crawler", {
			method: "POST",
			body: JSON.stringify({
				// Using a mockup URL that we don't actually fetch in the test
				// since we'll mock the internal fetch if possible, 
				// but wait, SELF.fetch runs the REAL worker code.
				// Mocking global fetch inside the worker from HERE is tricky.
				urls: ["https://example.com"], 
				bookId: 1,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		// Since we can't easily mock fetch inside the REAL worker from here 
		// without extra setup, this test might fail to fetch.
		// However, let's see if the seeding worked first.
		
		const body = await res.json() as any;
		if (res.status !== 200) {
			console.error("Crawler failed:", body);
		}
		expect(res.status).toBe(200);
		expect(body.success).toBe(true);

	});
});
