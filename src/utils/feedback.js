// Google Apps Script Web App URL
const FEEDBACK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw2dQbPZpeUJGHia399CwtwW30x06dYHp704D6zeDe05W0GDuvuu6uOEl-DpJCTLheSMw/exec';

export async function submitFeedback(data) {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors', // Required for Google Apps Script
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // With no-cors mode, we can't read the response
  // Google Apps Script will still receive and process the data
  // We assume success if no error is thrown
  return { success: true };
}
