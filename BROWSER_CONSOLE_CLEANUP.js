// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Clear all cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Reload page
window.location.href = '/login';
