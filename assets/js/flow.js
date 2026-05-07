/* ================================================================
 * flow.js — клиентский стейт-машина: hero → chat → reg → dashboard
 * ================================================================ */
var Flow = (function() {

    var STEPS = {
        HERO:           'hero',
        CHAT:           'chat',
        REGISTER:       'register',
        VERIFY:         'verify',
        DASHBOARD:      'dashboard'
    };

    var current = STEPS.HERO;

    function go(step) {
        current = step;
        document.querySelectorAll('[data-flow-step]').forEach(function(el) {
            el.style.display = (el.dataset.flowStep === step) ? '' : 'none';
        });
        if (typeof UI !== 'undefined') UI.scrollToBottom(true);
    }

    function init() {
        if (AppState.isLoggedIn) {
            go(STEPS.DASHBOARD);
        } else if (AppState.pendingVerify) {
            go(STEPS.VERIFY);
        } else {
            go(STEPS.HERO);
        }
    }

    function afterFirstMessage() { go(STEPS.CHAT); }
    function afterChatStart()    { go(STEPS.REGISTER); }
    function afterRegister()     { go(STEPS.VERIFY); }
    function afterVerify()       { go(STEPS.DASHBOARD); }

    return {
        STEPS: STEPS,
        go: go,
        init: init,
        afterFirstMessage: afterFirstMessage,
        afterChatStart:    afterChatStart,
        afterRegister:     afterRegister,
        afterVerify:       afterVerify,
        current: function() { return current; }
    };
})();
