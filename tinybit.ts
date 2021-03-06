/**
 * Some special colors for the Tiny:bit.  Neopixel colors will work too.
 */
enum TinyBitColor {
  //% block=red
  Red = 0xFF0000,
  //% block=green
  Green = 0x00FF00,
  //% block=blue
  Blue = 0x0000FF,
  //% block=orange
  Orange = 0xBF8000,
}

/**
 * Controls the functions of the Yahboom Tiny:bit robot.
 */
//% color=#ebd534 weight=100 icon="\uf1b9"
//% groups='["Motors", "Distance Sensor", "Line Reader","Headlights", "Nav Lights", "Utilities", "Infrared", "Logging"]'
namespace tinybit {
  const PwmControllerAddress = 0x01;
  const RgbPinGroup = 0x01;
  const MotorPinGroup = 0x02;

  const DRIVE_BIAS = 2;
  const ROTATION_SENSITIVITY = 2;

  let loggingEnabled = false;
  let navLightStrip: neopixel.Strip;
  let speedLimit = 255;

  function log(message: string): void {
    if (!loggingEnabled) { return; }
    console.log(message);
  }

  function toRgb(color: number): [number, number, number] {
    const red = (color >> 16) & 0xFF;
    const green = (color >> 8) & 0xFF;
    const blue = color & 0xFF;

    return [red, green, blue];
  }

  /**
   * Enable and disable logging
   * @param enabled whether or not logging is on
   */
  //% blockId="tinybit_setLoggingStatus" block="show log messages %enabled"
  //% weight=1
  //% group="Logging"
  //% advanced=true
  //% enabled.defl=false
  export function setLoggingEnabled(enabled: boolean): void {
    loggingEnabled = enabled;
  }

  /**
   * Gets a color value by name.
   */
  //% weight=1
  //% blockId="tinybit_color" block="%color"
  //% advanced=true
  //% group="Utilities"
  export function color(color: TinyBitColor): number {
    return color;
  }

  /**
   * Creates a color from red, green, and blue components.
   * @param red value of the red channel between 0 and 255. eg: 255
   * @param green value of the green channel between 0 and 255. eg: 255
   * @param blue value of the blue channel between 0 and 255. eg: 255
   */
  //% weight=2
  //% blockId="tinybit_rgb" block="red %red|green %green|blue %blue"
  //% red.min=0 red.max=255
  //% green.min=0 green.max=255
  //% blue.min=0 blue.max=255
  //% advanced=true
  //% group="Utilities"
  export function rgb(red: number, green: number, blue: number): number {
    return (red & 0xFF) << 16 | (green & 0xFF) << 8 | (blue & 0xFF);
  }

  /**
   * Sets a color on the headlights.
   */
  //% blockId="tinybit_setHeadlightColor" block="set headlights to %color=tinybit_color"
  //% weight=1
  //% group="Headlights"
  export function setHeadlightColor(color: number) {
    const [red, green, blue] = toRgb(color);
    const i2cBuffer = pins.createBuffer(4);

    i2cBuffer[0] = RgbPinGroup;
    i2cBuffer[1] = red;
    i2cBuffer[2] = green;
    i2cBuffer[3] = blue;

    pins.i2cWriteBuffer(PwmControllerAddress, i2cBuffer);
  }

  /**
   * The neopixel strip for the nav lights
   */
  //% blockId="tinybit_navLights" block="nav light strip"
  //% group="Nav Lights"
  export function navLights(): neopixel.Strip {
    if (!navLightStrip) {
      navLightStrip = neopixel.create(DigitalPin.P12, 2, NeoPixelMode.RGB);
    }
    return navLightStrip;
  }

  /**
   * Measure the distance to an obstacle in cm.
   */
  //% group="Distance Sensor"
  //% blockId="tinybit_distance" block="distance to obstacle (cm)"
  export function distance(): number {
    pins.digitalWritePin(DigitalPin.P16, 0);
    control.waitMicros(2);
    pins.digitalWritePin(DigitalPin.P16, 1);
    control.waitMicros(10);
    pins.digitalWritePin(DigitalPin.P16, 0);

    const distance = pins.pulseIn(DigitalPin.P15, PulseValue.High, 23200);
    return distance / 58;
  }

  /**
   * Set the maximum motor speed
   * @param maxSpeed the maximum speed the motors are allowed to turn between 0 and 255. eg: 255
   */
  //% blockId="tinybit_setSpeedLimit" block="set speed limit %maxSpeed"
  //% group="Motors"
  //% maxSpeed.min=0 maxSpeed.max=255 maxSpeed.defl=255
  export function setSpeedLimit(maxSpeed: number): void {
    speedLimit = maxSpeed;
  }

  /**
   * Set the motor speeds
   * @param left speed percentage of the left motor between -100 and 100. eg: 50
   * @param right speed percentage of the right motor between -100 and 100. eg: 50
   */
  //% blockId="tinybit_setMotorSpeeds" block="motor speed|left %left|right %right"
  //% group="Motors"
  //% left.min=-100 left.max=100 left.defl=50
  //% right.min=-100 right.max=100 right.defl=50
  export function setMotorSpeeds(left: number, right: number): void {
    const leftPower = Math.round(left * speedLimit / 100);
    const rightPower = Math.round(right * speedLimit / 100);

    log(`Left motor power: ${leftPower}`);
    log(`Right motor power: ${rightPower}`);

    const leftForward = Math.max(0, leftPower);
    const leftReverse = Math.max(0, -leftPower);
    const rightForward = Math.max(0, rightPower);
    const rightReverse = Math.max(0, -rightPower);

    const motorBuffer = pins.createBuffer(5);
    motorBuffer[0] = MotorPinGroup;
    motorBuffer[1] = leftForward;
    motorBuffer[2] = leftReverse;
    motorBuffer[3] = rightForward;
    motorBuffer[4] = rightReverse;

    pins.i2cWriteBuffer(PwmControllerAddress, motorBuffer);
  }

  /**
   * Set the vehicle direction
   * @param x percentage of rotation applied between -100 and 100. eg: 0
   * @param y percentage of movement applied between -100 and 100. eg: 50
   */
  //% blockId="tinybit_setMotorVector" block="motor power|x %x|y %y"
  //% group="Motors"
  //% x.min=-100 x.max=100 x.defl=0
  //% y.min=-100 y.max=100 y.defl=20
  export function setMotorVector(x: number, y: number): void {
    const maxPower = Math.min(100, Math.sqrt(x * x + y * y));

    const absX = Math.abs(x);
    const absY = Math.abs(y);

    let rotationalIntent = absX / (absX + absY * DRIVE_BIAS) || 0;
    rotationalIntent = Math.pow(rotationalIntent, ROTATION_SENSITIVITY);
    const differentialPower = Math.map(rotationalIntent, 0, 1, maxPower, -maxPower);

    const speedSettings = y < 0 ? [-differentialPower, -maxPower] : [maxPower, differentialPower];
    if (x < 0) {
      speedSettings.reverse();
    }

    const [left, right] = speedSettings;
    setMotorSpeeds(left, right);
  }
}