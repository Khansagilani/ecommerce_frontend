document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const response = await fetch("http://localhost:8000/api/admin/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const data = await response.json();

        console.log("Login response:", data);

        if (!response.ok) {
            document.getElementById("loginMsg").innerText = "Incorrect login";
            return;
        }

        // TRY ALL POSSIBLE TOKEN NAMES
        const token = data.access_token || data.token || data.jwt;

        if (!token) {
            document.getElementById("loginMsg").innerText = "No token received from backend";
            return;
        }

        localStorage.setItem("token", token);

        // redirect to dashboard
        window.location.href = "adminindex.html";

    } catch (error) {
        console.error(error);
        document.getElementById("loginMsg").innerText = "Server error";
    }
});