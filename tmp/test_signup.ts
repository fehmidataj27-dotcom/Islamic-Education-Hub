
import fetch from "node-fetch";

async function testSignup() {
    const data = {
        firstName: "Test",
        lastName: "User",
        email: "test_new_signup@example.com",
        username: "testuser123",
        password: "password123",
        role: "student"
    };

    try {
        const res = await fetch("http://localhost:5000/api/signup/local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            console.log("Signup successful!");
            const user = await res.json();
            console.log(user);
        } else {
            console.error("Signup failed:", await res.json());
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

testSignup();
