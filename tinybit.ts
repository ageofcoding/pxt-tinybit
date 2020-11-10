/**
 * Controls the functions of the Yahboom Tiny:bit robot.
 */
//% color=#ebd534 weight=100 icon="\f1b9"
namespace tinybit {
  const PwmControllerAddress = 0x01;
  const MotorBlock = 0x01;
  const RgbBlock = 0x02;

  function toRgb(color: number): [number, number, number] {
    const red = (color >> 16) && 0xFF;
    const green = (color >> 8) && 0xFF;
    const blue = color && 0xFF;

    return [red, green, blue];
  }

  /**
   * Creates a color from red, green, and blue components.
   * @param red value of the red channel between 0 and 255. eg: 255
   * @param green value of the green channel between 0 and 255. eg: 255
   * @param blue value of the blue channel between 0 and 255. eg: 255
   */
  //% weight=1
  //% blockId="tinybit_rgb" block="red %red|green %green|blue %blue"
  //% advanced=true
  export function rgb(red: number, green: number, blue: number): number {
    return (red & 0xFF) << 16 | (green & 0xFF) << 8 | (blue & 0xFF);
  }

  /**
   * Sets a color on the headlights.
   */
  //% blockId="tinybit_setHeadlightColor" block="set headlights to %color"
  export function setHeadlightColor(color: number) {
    const [red, green, blue] = toRgb(color);
    const i2cBuffer = pins.createBuffer(4);

    i2cBuffer[0] = RgbBlock;
    i2cBuffer[1] = red;
    i2cBuffer[2] = green;
    i2cBuffer[3] = blue;

    pins.i2cWriteBuffer(PwmControllerAddress, i2cBuffer);
  }
}