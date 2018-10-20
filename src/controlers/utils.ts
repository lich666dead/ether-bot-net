export class Utils {
  public static onRandom(min: number, max: number): number {
    let rand: number;

    if (min === max) {
      return max;
    }

    try {
      rand = min + Math.random() * (max + 1 - min);
      return Math.floor(rand);
    } catch (err) {
      return min;
    }    
  }
}