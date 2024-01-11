import pointInPolygon from 'point-in-polygon';
import RandomGeoPointGenerator from './utils/RandomGeoPointGenerator';

describe('RandomGeoPointGenerator Class Tests', () => {
    const numberOfIterations = 10; // configurable number of iterations for each test

    const randomGeoPointInside: RandomGeoPointGenerator = new RandomGeoPointGenerator();
    const randomGeoPointOutside: RandomGeoPointGenerator = new RandomGeoPointGenerator();

    // Test Random Coordinate Generation
    it.each(Array.from({ length: numberOfIterations }))(
        'testGenerateRandomCoordinate',
        async () => {
            const min = -180;
            const max = 180;
            const precision = Math.floor(Math.random() * 8);
            const coordinate = RandomGeoPointGenerator.generateRandomCoordinate(min, max, precision);
            expect(coordinate).toBeGreaterThanOrEqual(min);
            expect(coordinate).toBeLessThanOrEqual(max);
            expect(coordinate.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(precision);
        }
    );

    // Test Random GeoPoint Generation
    it.each(Array.from({ length: numberOfIterations }))(
        'testGenerateRandomZKGeoPoint',
        async () => {
            const geoPoint = RandomGeoPointGenerator.generateRandomZKGeoPoint();
            expect(geoPoint.latitude).toBeGreaterThanOrEqual(-90);
            expect(geoPoint.latitude).toBeLessThanOrEqual(90);
            expect(geoPoint.longitude).toBeGreaterThanOrEqual(-180);
            expect(geoPoint.longitude).toBeLessThanOrEqual(180);
        }
    );

    // Test Triangle Generation with Point Inside
    it.each(Array.from({ length: numberOfIterations }))(
        'testGenerateTriangleWithPointInside',
        async () => {
            const point = RandomGeoPointGenerator.generateRandomZKGeoPoint();
            const triangle = randomGeoPointInside.generateTriangleWithPointInside(point);
            const isInside = pointInPolygon([point.latitude, point.longitude], triangle.map(p => [p.latitude, p.longitude]));

            if (!isInside) {
                console.log(`Failed testGenerateTriangleWithPointInside: point ${JSON.stringify(point)}, triangle ${JSON.stringify(triangle)}`);
            }

            expect(isInside).toBe(true);
        } 
    );

    // Test Triangle Generation with Point Outside
    it.each(Array.from({ length: numberOfIterations }))(
        'testGenerateTriangleWithPointOutside',
        async () => {
            const point = RandomGeoPointGenerator.generateRandomZKGeoPoint();
            const triangle = randomGeoPointOutside.generateTriangleWithPointOutside(point);
            const isOutside = !pointInPolygon([point.latitude, point.longitude], triangle.map(p => [p.latitude, p.longitude]));

            if (!isOutside) {
                console.log(`Failed testGenerateTriangleWithPointOutside: point ${JSON.stringify(point)}, triangle ${JSON.stringify(triangle)}`);
            }

            expect(isOutside).toBe(true);
        }
    );

    // Test Triangle Generation with Point on Edge
    // Note: This test might need refinement to ensure the point is exactly on the edge
    it.each(Array.from({ length: numberOfIterations }))(
        'testGenerateTriangleWithPointOnEdge',
        async () => {
            const point = RandomGeoPointGenerator.generateRandomZKGeoPoint();
            const triangle = RandomGeoPointGenerator.generateTriangleWithPointOnEdge(point);
            // Additional logic might be required to ensure the point is exactly on the edge
        }
    );

    // Test Precision Consistency
    it.each(Array.from({ length: numberOfIterations }))(
        'testPrecisionConsistency',
        async () => {
            const point = RandomGeoPointGenerator.generateRandomZKGeoPoint();
            const triangle = RandomGeoPointGenerator.generateTriangleWithPointInside(point);
            const pointPrecision = Math.max(
                point.latitude.toString().split('.')[1]?.length || 0, 
                point.longitude.toString().split('.')[1]?.length || 0
            );
            triangle.forEach(p => {
                const latitudePrecision = p.latitude.toString().split('.')[1]?.length || 0;
                const longitudePrecision = p.longitude.toString().split('.')[1]?.length || 0;
                expect(latitudePrecision).toBeLessThanOrEqual(pointPrecision);
                expect(longitudePrecision).toBeLessThanOrEqual(pointPrecision);
            });
        }
    );

    // Test Edge Cases and Failure Conditions
    // Assuming generateRandomCoordinate handles edge cases internally
});


describe('RandomGeoPointGenerator Unique Triangle Tests', () => {
    const numCalls = 10;
  
    it('should not generate the same triangle twice for the same point (inside)', () => {
      const generator = new RandomGeoPointGenerator();
      const point = RandomGeoPointGenerator.generateRandomZKGeoPoint();
  
      for (let i = 0; i < numCalls; i++) {
        expect(() => generator.generateTriangleWithPointInside(point)).not.toThrow('Duplicate triangle generated for type inside');
      }
    });
  
    it('should not generate the same triangle twice for the same point (outside)', () => {
      const generator = new RandomGeoPointGenerator();
      const point = RandomGeoPointGenerator.generateRandomZKGeoPoint();
  
      for (let i = 0; i < numCalls; i++) {
        expect(() => generator.generateTriangleWithPointOutside(point)).not.toThrow('Duplicate triangle generated for type outside');
      }
    });
  
    it('should not generate the same triangle twice for the same point (on edge)', () => {
      const generator = new RandomGeoPointGenerator();
      const point = RandomGeoPointGenerator.generateRandomZKGeoPoint();
  
      for (let i = 0; i < numCalls; i++) {
        expect(() => generator.generateTriangleWithPointOnEdge(point)).not.toThrow('Duplicate triangle generated for type edge');
      }
    });
  });