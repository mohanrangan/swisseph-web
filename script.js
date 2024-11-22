// API URL configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://swisseph-backend.onrender.com'; // We'll update this URL once we deploy the backend

// Sample data structure for planets
const planets = [
    { name: 'Sun', id: 0 },
    { name: 'Moon', id: 1 },
    { name: 'Mercury', id: 2 },
    { name: 'Venus', id: 3 },
    { name: 'Mars', id: 4 },
    { name: 'Jupiter', id: 5 },
    { name: 'Saturn', id: 6 },
    { name: 'True Node', id: 11 }
];

// Calculate positions using the backend API
async function calculatePositions() {
    const dateInput = document.getElementById('date').value;
    if (!dateInput) {
        alert('Please select a date');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: dateInput })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        updateTable(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error calculating positions. Please try again later.');
    }
}

// Update the table with calculated positions
function updateTable(positions) {
    const tbody = document.querySelector('#positions tbody');
    tbody.innerHTML = ''; // Clear existing data

    positions.forEach(position => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${position.name}</td>
            <td>${position.sign}</td>
            <td>${position.degrees.toString().padStart(2, '0')}°</td>
            <td>${position.minutes.toString().padStart(2, '0')}'</td>
            <td>${position.seconds.toString().padStart(2, '0')}"</td>
            <td>${position.absolute_position.toFixed(6)}°</td>
        `;
        tbody.appendChild(row);
    });
}

// Check backend health
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'healthy') {
                document.querySelector('.info-message').style.display = 'none';
                return;
            }
        }
    } catch (error) {
        console.error('Backend health check failed:', error);
    }
    
    // Show warning if backend is not available
    const infoMessage = document.querySelector('.info-message');
    infoMessage.style.display = 'block';
    infoMessage.textContent = 'Warning: Server connection issue. Please try again later.';
    infoMessage.style.color = '#ff4444';
}

// Set default date to today and initialize
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    checkBackendHealth();
    calculatePositions();
});
