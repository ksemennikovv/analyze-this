/* ================================================================
 * state.js — единое frontend-состояние приложения
 * ================================================================ */
window.AppState = {
    user:            null,
    isLoggedIn:      false,
    currentAction:   null,
    feed:            [],
    chatHistory:     [],
    subscription:    null,
    credits:         { included: 0, package: 0 },
    selectedPractice: null,
    lang:            localStorage.getItem('lang') || 'ru',
};
