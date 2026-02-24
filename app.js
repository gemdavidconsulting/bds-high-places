/**
 * HIGH PLACES YOUTH MINISTRY — INTAKE FORM
 * ==========================================
 * Handles form validation and submission to Google Sheets
 * via a Google Apps Script Web App endpoint.
 *
 * SETUP: Replace GOOGLE_SCRIPT_URL below with your
 * deployed Google Apps Script Web App URL.
 */

// ============================================
// CONFIGURATION — UPDATE THIS URL AFTER DEPLOYING YOUR GOOGLE APPS SCRIPT
// ============================================
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

// ============================================
// DOM References
// ============================================
const form = document.getElementById('intake-form');
const submitBtn = document.getElementById('submit-btn');
const successOverlay = document.getElementById('success-overlay');

// ============================================
// Form Validation
// ============================================
function validateField(field, errorId, message) {
  const errorEl = document.getElementById(errorId);
  if (!field.value.trim()) {
    field.classList.add('error');
    if (errorEl) errorEl.textContent = message;
    return false;
  }
  field.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
  return true;
}

function validateEmail(field, errorId) {
  const errorEl = document.getElementById(errorId);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!field.value.trim()) {
    field.classList.add('error');
    if (errorEl) errorEl.textContent = 'Email is required';
    return false;
  }
  if (!emailRegex.test(field.value.trim())) {
    field.classList.add('error');
    if (errorEl) errorEl.textContent = 'Please enter a valid email address';
    return false;
  }
  field.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
  return true;
}

function validateAge(field, errorId) {
  const errorEl = document.getElementById(errorId);
  const age = parseInt(field.value, 10);
  if (!field.value.trim() || isNaN(age)) {
    field.classList.add('error');
    if (errorEl) errorEl.textContent = 'Age is required';
    return false;
  }
  if (age < 10 || age > 30) {
    field.classList.add('error');
    if (errorEl) errorEl.textContent = 'Age must be between 10 and 30';
    return false;
  }
  field.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
  return true;
}

function validateInterests() {
  const checkboxes = document.querySelectorAll('input[name="interests"]:checked');
  const errorEl = document.getElementById('error-interests');
  if (checkboxes.length === 0) {
    if (errorEl) errorEl.textContent = 'Please select at least one career interest';
    return false;
  }
  if (errorEl) errorEl.textContent = '';
  return true;
}

function validateForm() {
  const fullName = document.getElementById('fullName');
  const age = document.getElementById('age');
  const email = document.getElementById('email');
  const zone = document.getElementById('zone');

  let valid = true;

  if (!validateField(fullName, 'error-fullName', 'Full name is required')) valid = false;
  if (!validateAge(age, 'error-age')) valid = false;
  if (!validateEmail(email, 'error-email')) valid = false;
  if (!validateField(zone, 'error-zone', 'Zone / neighborhood is required')) valid = false;
  if (!validateInterests()) valid = false;

  return valid;
}

// ============================================
// Live validation — clear errors on input
// ============================================
document.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('error');
    const errorEl = el.closest('.form-group')?.querySelector('.error-msg');
    if (errorEl) errorEl.textContent = '';
  });
});

document.querySelectorAll('input[name="interests"]').forEach(cb => {
  cb.addEventListener('change', () => {
    const errorEl = document.getElementById('error-interests');
    if (errorEl) errorEl.textContent = '';
  });
});

// ============================================
// Collect Form Data
// ============================================
function collectFormData() {
  const interests = Array.from(
    document.querySelectorAll('input[name="interests"]:checked')
  ).map(cb => cb.value);

  return {
    fullName: document.getElementById('fullName').value.trim(),
    age: document.getElementById('age').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    school: document.getElementById('school').value.trim(),
    grade: document.getElementById('grade').value,
    zone: document.getElementById('zone').value.trim(),
    interests: interests.join(', '),
    goals: document.getElementById('goals').value.trim(),
    notes: document.getElementById('notes').value.trim(),
    parentContact: document.getElementById('parentContact').value.trim(),
    submittedAt: new Date().toLocaleString()
  };
}

// ============================================
// Submit Handler
// ============================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    // Scroll to first error
    const firstError = document.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Check if Google Script URL is configured
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
    alert(
      '⚠️ Google Apps Script URL not configured!\n\n' +
      'Please deploy the Google Apps Script (see google-apps-script.js) and update the GOOGLE_SCRIPT_URL in app.js.'
    );
    return;
  }

  const data = collectFormData();

  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // With no-cors, we can't read the response, but if no error thrown, assume success
    showSuccess();
  } catch (error) {
    console.error('Submission error:', error);
    alert('❌ Something went wrong while submitting. Please check your internet connection and try again.');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

// ============================================
// Success UI
// ============================================
function showSuccess() {
  successOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function resetForm() {
  form.reset();
  successOverlay.classList.remove('visible');
  document.body.style.overflow = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close overlay on background click
successOverlay.addEventListener('click', (e) => {
  if (e.target === successOverlay) {
    resetForm();
  }
});

// Close overlay on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && successOverlay.classList.contains('visible')) {
    resetForm();
  }
});
