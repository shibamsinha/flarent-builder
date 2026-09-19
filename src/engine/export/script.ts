/**
 * The only JavaScript an exported site ships.
 *
 * It exists for one reason: a static page has no server, so contact forms need
 * somewhere to go. If the site owner configured an endpoint we POST to it,
 * otherwise the submission is kept in the visitor's browser and the success
 * message is shown. Nothing else on the page depends on this file.
 */
export const EXPORT_SCRIPT = String.raw`(function () {
  'use strict';
  var STORAGE_KEY = 'flarent.submissions';

  function setStatus(form, message, state) {
    var status = form.querySelector('.fl-form-status');
    if (!status) return;
    status.textContent = message;
    status.setAttribute('data-state', state);
  }

  function store(payload) {
    try {
      var existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.push(payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (error) {
      /* storage may be unavailable; the message still confirms receipt */
    }
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || !form.classList || !form.classList.contains('fl-form')) return;
    event.preventDefault();

    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = value;
    });

    var payload = {
      formId: form.getAttribute('data-fl-form') || 'form',
      submittedAt: new Date().toISOString(),
      data: data
    };
    var success = form.getAttribute('data-fl-success') || 'Thank you — your message has been sent.';
    var endpoint = form.getAttribute('data-fl-endpoint');
    var button = form.querySelector('button[type="submit"]');

    if (!endpoint) {
      store(payload);
      form.reset();
      setStatus(form, success, 'ok');
      return;
    }

    if (button) button.disabled = true;
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Request failed');
        form.reset();
        setStatus(form, success, 'ok');
      })
      .catch(function () {
        store(payload);
        setStatus(form, 'We could not send that just now. Please try again or call us.', 'error');
      })
      .then(function () {
        if (button) button.disabled = false;
      });
  });
})();
`;
