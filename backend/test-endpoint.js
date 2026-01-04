async function testUpdate() {
    try {
        console.log('Testing connection to http://localhost:8000/api...');
        // First login to get token
        const loginRes = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'client@example.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful, token:', token ? 'YES' : 'NO');

        if (!token) {
            console.error('Login failed:', loginData);
            return;
        }

        // Try GET me
        console.log('Fetching ME...');
        const meRes = await fetch('http://localhost:8000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        console.log('Current Simulation Mode:', meData.simulationMode);

        // Try PATCH
        console.log('Updating Simulation Mode...');
        const res = await fetch('http://localhost:8000/api/auth/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ simulationMode: true })
        });

        console.log('Update Status:', res.status);
        const data = await res.json();
        console.log('Update result:', data.simulationMode);
    } catch (error) {
        console.error('Error:', error);
    }
}

testUpdate();
