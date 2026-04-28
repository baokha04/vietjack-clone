import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

async function createCategory(path: string, data: any) {
	const response = await SELF.fetch(`http://local.test/content/${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const body = await response.json<{
		success: boolean;
		result: { id: number };
	}>();
	return body.result.id;
}

describe("Content Categories API Integration Tests", () => {
    
    describe("Publisher CRUD", () => {
        it("should create, read, update, and delete a publisher", async () => {
            // Create
            const publisherData = {
                name: "Test Publisher",
                description: "Test description"
            };
            const responseCreate = await SELF.fetch(`http://local.test/content/publisher`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(publisherData),
            });
            const bodyCreate = await responseCreate.json<{ success: boolean; result: any }>();
            expect(responseCreate.status).toBe(201);
            const publisherId = bodyCreate.result.id;

            // Read
            const responseRead = await SELF.fetch(`http://local.test/content/publisher/${publisherId}`);
            const bodyRead = await responseRead.json<{ success: boolean; result: any }>();
            expect(responseRead.status).toBe(200);
            expect(bodyRead.result.name).toBe("Test Publisher");

            // Update
            const updatedData = { name: "Updated Publisher" };
            const responseUpdate = await SELF.fetch(`http://local.test/content/publisher/${publisherId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            expect(responseUpdate.status).toBe(200);

            // Verify Update
            const responseReadAfterUpdate = await SELF.fetch(`http://local.test/content/publisher/${publisherId}`);
            const bodyReadAfterUpdate = await responseReadAfterUpdate.json<{ result: any }>();
            expect(bodyReadAfterUpdate.result.name).toBe("Updated Publisher");

            // Delete
            const responseDelete = await SELF.fetch(`http://local.test/content/publisher/${publisherId}`, {
                method: "DELETE"
            });
            expect(responseDelete.status).toBe(200);

            // Verify Delete (Read should return 404)
            const responseReadAfterDelete = await SELF.fetch(`http://local.test/content/publisher/${publisherId}`);
            expect(responseReadAfterDelete.status).toBe(404);
        });
    });

    describe("Class CRUD", () => {
        it("should create a class linked to a publisher", async () => {
            const publisherId = await createCategory("publisher", { name: "Class Publisher" });

            const classData = {
                name: "Test Class",
                publisherId: publisherId
            };
            const response = await SELF.fetch(`http://local.test/content/class`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(classData),
            });
            const body = await response.json<{ success: boolean; result: any }>();
            expect(response.status).toBe(201);
            expect(body.result.publisherId).toBe(publisherId);
        });
    });

    describe("Subject CRUD", () => {
        it("should create a subject linked to a class", async () => {
            const classId = await createCategory("class", { name: "Subject Class" });

            const subjectData = {
                name: "Test Subject",
                classId: classId
            };
            const response = await SELF.fetch(`http://local.test/content/subject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subjectData),
            });
            const body = await response.json<{ success: boolean; result: any }>();
            expect(response.status).toBe(201);
            expect(body.result.classId).toBe(classId);
        });
    });

    describe("Book CRUD", () => {
        it("should create a book linked to a subject", async () => {
            const subjectId = await createCategory("subject", { name: "Book Subject" });

            const bookData = {
                name: "Test Book",
                url: "http://example.com",
                subjectId: subjectId
            };
            const response = await SELF.fetch(`http://local.test/content/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookData),
            });
            const body = await response.json<{ success: boolean; result: any }>();
            expect(response.status).toBe(201);
            expect(body.result.subjectId).toBe(subjectId);
        });
    });
});
