/**
 * Generates random geographical points with specific precision constraints.
 */
export default class RandomGeoPointGenerator {
    private static generateRandomCoordinate(min: number, max: number, precision: number): number {
        return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
    }

    public static generateRandomZKGeoPoint(): { latitude: number; longitude: number } {
        const precision = Math.floor(Math.random() * 8); // 0 to 7 decimal points
        const latitude = this.generateRandomCoordinate(-90, 90, precision);
        const longitude = this.generateRandomCoordinate(-180, 180, precision);
        return { latitude, longitude };
    }
}
