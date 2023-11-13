import { Provable } from "o1js";
import { Int64Prover } from "../math/Provers.js";
/** Main Circuits */
export function isPointOnEdgeProvable(point, vertice1, vertice2) {
    const x = point.point.latitude;
    const y = point.point.longitude;
    const x1 = vertice1.latitude; // edge start
    const y1 = vertice1.longitude; // edge start
    const x2 = vertice2.latitude; // edge end
    const y2 = vertice2.longitude; // edge end
    const isX1LargerThanX2 = Int64Prover.provableIsInt64XGreaterThanY(x1, x2);
    let maximumX = Provable.if(isX1LargerThanX2, x1, x2);
    let minimumX = Provable.if(isX1LargerThanX2, x2, x1);
    const isY1LargerThanY2 = Int64Prover.provableIsInt64XGreaterThanY(y1, y2);
    let maximumY = Provable.if(isY1LargerThanY2, y1, y2);
    let minimumY = Provable.if(isY1LargerThanY2, y2, y1);
    const withinXBounds = Int64Prover.provableIsInt64XLessThanOrEqualY(x, maximumX).and(Int64Prover.provableIsInt64XLessThanOrEqualY(minimumX, x));
    const withinYBounds = Int64Prover.provableIsInt64XLessThanOrEqualY(y, maximumY).and(Int64Prover.provableIsInt64XLessThanOrEqualY(minimumY, y));
    // Check if the point satisfies the line equation for the edge
    const xDifference1 = x2.sub(x1);
    const xDifference2 = x.sub(x1);
    const yDiffernce1 = y2.sub(y1);
    const yDiffernce2 = y.sub(y1);
    const firstProduct = xDifference1.mul(yDiffernce2);
    const secondProduct = xDifference2.mul(yDiffernce1);
    const onLine = Provable.equal(firstProduct, secondProduct);
    return withinXBounds.and(withinYBounds).and(onLine);
}
//# sourceMappingURL=Geography.js.map