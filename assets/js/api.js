/* ================================================================
 * api.js — единая обёртка над fetch
 * ================================================================ */
var API = (function() {

    function url(endpoint) {
        return endpoint.charAt(0) === '/' ? endpoint : '/api/' + endpoint;
    }

    async function post(endpoint, data) {
        var r = await fetch(url(endpoint), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return r.json();
    }

    async function postForm(endpoint, data) {
        var body = new FormData();
        Object.entries(data).forEach(function([k, v]) { body.append(k, v); });
        var r = await fetch(url(endpoint), { method: 'POST', body: body });
        return r.json();
    }

    async function get(endpoint) {
        var r = await fetch(url(endpoint));
        return r.json();
    }

    function authLogin(email, password) {
        return postForm('auth-login.php', { email: email, password: password });
    }

    function authLogout() { return post('auth-logout.php', {}); }

    function authForgot(email) {
        return postForm('auth-forgot-password.php', { email: email });
    }

    function authReset(email, code, password) {
        return postForm('auth-reset-password.php', { email: email, code: code, password: password });
    }

    function getSession() { return get('user-session.php'); }

    function register(email, history) {
        return post('auth-register.php', { email: email, history: history || [] });
    }

    function resendVerification(email) {
        return post('auth-resend-verification.php', { email: email });
    }

    function sendAnalysisMessage(messages) {
        return fetch('/api/ai-analysis-message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messages })
        });
    }

    function getFeed() { return get('flow-get-feed.php'); }
    function getCurrentAction() { return get('flow-get-current-action.php'); }
    function getBillingStatus() { return get('billing-get-status.php'); }

    return {
        post, postForm, get,
        authLogin, authLogout, authForgot, authReset,
        getSession, register, resendVerification,
        sendAnalysisMessage,
        getFeed, getCurrentAction, getBillingStatus,
    };
})();
