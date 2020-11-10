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
//% color=#ebd534 weight=100 icon="\f544"
namespace tinybit {
  const PwmControllerAddress = 0x01;
  const RgbBlock = 0x01;
  const MotorBlock = 0x02;

  let navLightStrip: neopixel.Strip;

  function toRgb(color: number): [number, number, number] {
    const red = (color >> 16) & 0xFF;
    const green = (color >> 8) & 0xFF;
    const blue = color & 0xFF;

    return [red, green, blue];
  }

  /**
   * Gets a color value by name.
   * @param color color name
   */
  //% weight=1
  //% blockId="tinybit_color" block="color %color"
  //% advanced=true
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
  //% advanced=true
  export function rgb(red: number, green: number, blue: number): number {
    return (red & 0xFF) << 16 | (green & 0xFF) << 8 | (blue & 0xFF);
  }

  /**
   * Sets a color on the headlights.
   */
  //% blockId="tinybit_setHeadlightColor" block="set headlights to %color"
  //% weight=1
  export function setHeadlightColor(color: number) {
    const [red, green, blue] = toRgb(color);
    const i2cBuffer = pins.createBuffer(4);

    i2cBuffer[0] = RgbBlock;
    i2cBuffer[1] = red;
    i2cBuffer[2] = green;
    i2cBuffer[3] = blue;

    pins.i2cWriteBuffer(PwmControllerAddress, i2cBuffer);
  }

  /**
   * The neopixel strip for the nav lights
   */
  //% blockId="tinybit_navLights" block="nav light strip"
  export function navLights(): neopixel:Strip {
    if (!navLightStrip) {
      navLightStrip = neopixel.create(DigitalPin.P12, 2, NeoPixelMode.RGB);
    }
    return navLightStrip;
  }
}