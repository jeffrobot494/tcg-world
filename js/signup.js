// Wrap in DOMContentLoaded to ensure the form element exists
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('signupForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get config at the time of submission - by now it will definitely be loaded
    const config = window.CONFIG;
    console.log('Using API URL:', config.API_URL);
    
    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch(`${config.API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = `${config.BASE_HTML_PATH || ''}dashboard.html`;
      } else {
        alert(`Signup failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed due to a network error. Please try again.');
    }
  });
});