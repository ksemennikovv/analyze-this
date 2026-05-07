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

    async f