const APP_NAME = "Bangle Paint";
let isConnected = false;

function onAccel(d) {
  if (isConnected) {
    NRF.updateServices({
      "f8b23a4d-89ad-4220-8c9f-d81756009f0c": {
        "f8b23a4d-89ad-4220-8c9f-d81756009f0d": {
          value: new Float32Array([d.x, d.y, d.z]).buffer,
          notify: true,
        },
      },
    });
  }
}

function onConnect() {
  isConnected = true;
  Bangle.setCompassPower(1);
  E.showMessage("Wave your arms!", APP_NAME);
}

function onDisconnect() {
  isConnected = false;
  Bangle.setCompassPower(0);
  showWaiting();
}

function showWaiting() {
  E.showMessage("Waiting...", APP_NAME);
}

function onInit() {
  NRF.on("connect", onConnect);
  NRF.on("disconnect", onDisconnect);

  // declare the services
  NRF.setServices({
    "f8b23a4d-89ad-4220-8c9f-d81756009f0c": {
      "f8b23a4d-89ad-4220-8c9f-d81756009f0d": {
        description: "Bangle accelerometer",
        notify: true,
        readable: true,
        value: new Float32Array([0, 0, 0, 0, 0]).buffer,
      },
    },
  });
  Bangle.on("accel", onAccel);
  NRF.disconnect();
  showWaiting();
}

onInit();
