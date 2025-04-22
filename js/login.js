// Wrap in DOMContentLoaded to ensure the form element exists
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get config at the time of submission - by now it will definitely be loaded
    const config = window.CONFIG;
    console.log('Using API URL:', config.API_URL);
    
    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch(`${config.API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = `${config.BASE_HTML_PATH || ''}dashboard.html`;
      } else {
        alert(`Login failed: ${data.error || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed due to a network error. Please try again.');
    }
  });
});