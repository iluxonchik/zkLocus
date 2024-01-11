import Decimal from 'decimal.js';

/**
 * Represents a geographic point with latitude and longitude.
 */
interface GeoPoint {
    latitude: number;
    longitude: number;
}

/**
 * Generates random geographical points with specific precision constraints.
 */
export default class RandomGeoPointGenerator {
    /**
     * Generates a random coordinate within the specified range and precision.
     * @param min The minimum value for the coordinate.
     * @param max The maximum value for the coordinate.
     * @param precision The number of decimal places.
     * @returns A random coordinate as a number.
     */
    public static generateRandomCoordinate(min: number, max: number, precision: number): number {
        if (precision === 0) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            return parseFloat(new Decimal(Decimal.random(precision).mul(max - min).plus(min)).toFixed(precision));
        }
    }

    /**
     * Generates a random geographical point with a specified precision.
     * @returns A random GeoPoint object.
     */
    public static generateRandomZKGeoPoint(): GeoPoint {
        const precision = Math.floor(Math.random() * 8); // 0 to 7 decimal points
        const latitude = this.generateRandomCoordinate(-90, 90, precision);
        const longitude = this.generateRandomCoordinate(-180, 180, precision);
        return { latitude, longitude };
    }

    /**
     * Generates vertices for a triangle based on the given point and type.
     * @param point The reference point.
     * @param type The type of triangle to generate ('inside', 'outside', 'edge').
     * @param precision The precision for the vertices.
     * @returns An array of vertices (GeoPoint objects).
     */
    private static getTriangleVertices(point: GeoPoint, type: 'inside' | 'outside' | 'edge', precision: number): GeoPoint[] {
        let vertices: GeoPoint[] = [];
        const baseOffset = precision > 0? new Decimal(0.1): new Decimal(1);
        
        const randomOffset = new Decimal(Math.random() * 10).toFixed(precision); // Adding significant random offset

        let offset: string = (type === 'edge' ? baseOffset : baseOffset.plus(randomOffset)).toString();

        switch (type) {
            case 'inside':
                vertices = [
                    { latitude: point.latitude - parseFloat(offset), longitude: point.longitude - parseFloat(offset) },
                    { latitude: point.latitude + parseFloat(offset), longitude: point.longitude - parseFloat(offset) },
                    { latitude: point.latitude, longitude: point.longitude + parseFloat(offset) }
                ]; 
                break;
            case 'outside':
                vertices = [
                    { latitude: point.latitude + parseFloat(offset) + 1, longitude: point.longitude + parseFloat(offset) + 1 },
                    { latitude: point.latitude + parseFloat(offset) + 2, longitude: point.longitude + parseFloat(offset) + 1 },
                    { latitude: point.latitude + parseFloat(offset) + 1.5, longitude: point.longitude + parseFloat(offset) + 2 }
                ];
                break;
            case 'edge':
                // For 'edge', the offset is not randomized to maintain the point on the edge
                vertices = [
                    { latitude: point.latitude - parseFloat(baseOffset.toString()), longitude: point.longitude - parseFloat(baseOffset.toString()) },
                    { latitude: point.latitude + parseFloat(baseOffset.toString()), longitude: point.longitude + parseFloat(baseOffset.toString()) },
                    point
                ];
                break;
        }

        return vertices.map(v => ({
            latitude: Number(new Decimal(v.latitude).toFixed(precision)),
            longitude: Number(new Decimal(v.longitude).toFixed(precision))
        }));
    }


    /**
     * Generates a triangle polygon with the given point inside it.
     * @param point The point to be inside the triangle.
     * @returns A triangle polygon as an array of GeoPoints.
     */
    public static generateTriangleWithPointInside(point: GeoPoint): GeoPoint[] {
        const precision = Math.max(point.latitude.toString().split('.')[1]?.length || 0, point.longitude.toString().split('.')[1]?.length || 0);
        return this.getTriangleVertices(point, 'inside', precision);
    }

    /**
     * Generates a triangle polygon with the given point outside it.
     * @param point The point to be outside the triangle.
     * @returns A triangle polygon as an array of GeoPoints.
     */
    public static generateTriangleWithPointOutside(point: GeoPoint): GeoPoint[] {
        const precision = Math.max(point.latitude.toString().split('.')[1]?.length || 0, point.longitude.toString().split('.')[1]?.length || 0);
        return this.getTriangleVertices(point, 'outside', precision);
    }

    /**
     * Generates a triangle polygon with the given point on one of its edges.
     * @param point The point to be on the edge of the triangle.
     * @returns A triangle polygon as an array of GeoPoints.
     */
    public static generateTriangleWithPointOnEdge(point: GeoPoint): GeoPoint[] {
        const precision = Math.max(point.latitude.toString().split('.')[1]?.length || 0, point.longitude.toString().split('.')[1]?.length || 0);
        return this.getTriangleVertices(point, 'edge', precision);
    }
}
