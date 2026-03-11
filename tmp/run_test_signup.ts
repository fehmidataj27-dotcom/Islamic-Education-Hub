// Using built-in fetch

async function testSignup() {
    const timestamp = Date.now();
    const data = {
        firstName: "Test",
        lastName: "User",
        email: `test_signup_${timestamp}@example.com`,
        password: "password123",
        role: "student"
    };

    try {
        const res = await fetch("http://127.0.0.1:5000/api/signup/local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            console.log("Signup successful!");
            const user = await res.json();
            console.log(`User ID: ${user.id}`);
            return user.id;
        } else {
            console.error("Signup failed:", await res.json());
        }
    } catch (error) {
        console.error("Error during signup:", error);
    }
}

testSignup();
