(function ($, window) {
    'use strict';
    var app = window.appName = {};

    /* -----------------------------------------------------------------
     * Initialize
    ----------------------------------------------------------------- */
    app.init = function () {
        var cmn = {};

        cmn.init = function () {
            app.fn.addLog('init!');

        };

        return cmn;
    };

    /* -----------------------------------------------------------------
     * Utility functions
    ----------------------------------------------------------------- */
    app.fn = (function () {
        var module = {

            addLog: function (log) {
                console.log(log);
            }
        };

        return module;
    }());

    $.extend( jQuery.easing, {
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        }
    });

    /* -----------------------------------------------------------------
     * Setup
    ----------------------------------------------------------------- */
    $(function () {
        var app = window.appName.init();
        app.init();
    });
}(jQuery, window));