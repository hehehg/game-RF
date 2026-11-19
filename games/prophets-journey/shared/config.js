(function () {
  'use strict';
  window.PJ_CONFIG = {
    player: {
      walkSpeed: 11,
      runSpeed: 16,
      groundAcceleration: 7,
      groundDeceleration: 11,
      airAcceleration: 4,
      jumpSpeed: 10,
      gravity: 18,
      flightLift: 13,
      flightMaxRise: 7,
      maxFallSpeed: 18,
      coyoteTime: .12,
      jumpBuffer: .14,
      ceilingMargin: 2.2
    },
    camera: {
      smoothing: 7,
      distance: 12,
      height: 4.4
    },
    autoHelp: {
      hintDelay: 14,
      mistakeLimit: 3
    }
  };
})();
