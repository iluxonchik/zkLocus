import { Bool, Provable, Int64 } from "o1js";
import { Int64Prover } from "../math/Provers.js";
import { GeoPointWithNonce, GeographicalPoint } from '../model/Geography';


/** Main Circuits */


export function isPointOnEdgeProvable(point: GeoPointWithNonce, vertice1: GeographicalPoint, vertice2: GeographicalPoint) {
    const x: Int64 = point.point.latitude;
    const y: Int64 = point.point.longitude;
    const x1: Int64 = vertice1.latitude; // edge start
    const y1: Int64 = vertice1.longitude; // edge start
    const x2: Int64 = vertice2.latitude; // edge end
    const y2: Int64 = vertice2.longitude; // edge end

    const isX1LargerThanX2: Bool = Int64Prover.provableIsInt64XGreaterThanY(x1, x2);
    let maximumX: Int64 = Provable.if(isX1LargerThanX2, x1, x2);
    let minimumX: Int64 = Provable.if(isX1LargerThanX2, x2, x1);

    const isY1LargerThanY2: Bool = Int64Prover.provableIsInt64XGreaterThanY(y1, y2);
    let maximumY: Int64 = Provable.if(isY1LargerThanY2, y1, y2);
    let minimumY: Int64 = Provable.if(isY1LargerThanY2, y2, y1);

    const withinXBounds = Int64Prover.provableIsInt64XLessThanOrEqualY(x, maximumX).and(Int64Prover.provableIsInt64XLessThanOrEqualY(minimumX, x));
    const withinYBounds = Int64Prover.provableIsInt64XLessThanOrEqualY(y, maximumY).and(Int64Prover.provableIsInt64XLessThanOrEqualY(minimumY, y));

    // Check if the point satisfies the line equation for the edge
    const xDifference1: Int64 = x2.sub(x1);
    const xDifference2: Int64 = x.sub(x1);
    const yDiffernce1: Int64 = y2.sub(y1);
    const yDiffernce2: Int64 = y.sub(y1);

    const firstProduct: Int64 = xDifference1.mul(yDiffernce2);
    const secondProduct: Int64 = xDifference2.mul(yDiffernce1);
    const onLine = Provable.equal(
        firstProduct,
        secondProduct
    );

    return withinXBounds.and(withinYBounds).and(onLine);
}
