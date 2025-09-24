import crypto from "crypto";

// User 0 will always have the same email to make it easier to login to test dev server
export const USER_0_ID = crypto.randomUUID()
export const USER_1_ID = crypto.randomUUID();

export const TEST_USER_PASSWORD = "password123";
