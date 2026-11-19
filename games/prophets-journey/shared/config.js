(function () {
  'use strict';
  window.PJ_CONFIG = {
    player: {
      walkSpeed: 11,
      runSpeed: 16,
      groundAcceleration: 10,
      groundDeceleration: 14,
      airAcceleration: 7,
      jumpSpeed: 10,
      gravity: 18,
      flightLift: 16,
      flightMaxRise: 9,
      maxFallSpeed: 18,
      coyoteTime: .12,
      jumpBuffer: .14,
      hoverHeight: 1.5,
      collisionRadius: 1.8,
      collisionHalfHeight: 1.15,
      ceilingMargin: 2.2
    },
    camera: {
      smoothing: 7,
      distance: 12,
      height: 4.4
    },
    autoHelp: {
      enabled: true,
      hintDelay: 14,
      mistakeLimit: 3
    }
  };
})();
