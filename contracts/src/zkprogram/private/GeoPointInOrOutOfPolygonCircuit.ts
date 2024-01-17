import { SelfProof, Empty, ZkProgram } from "o1js";
import { GeoPointInOutPolygonCommitment } from '../../model/private/Commitment';
import { GeoPointInPolygonCircuitProof } from "./GeoPointInPolygonCircuit";
import { extendWithPointInPolygonProof, fromPointInPolygonProofs } from "../../logic/private/GeoPointInOrOutOfPolygon";

/*
 * This circuit extends the `GeoPointInPolygonCircuit` circuit, by allowing the expression of two-dimensional proofs
 * for private geolocation. `GeoPointInPolygonCircuit` allows for the expression of wether a given geogrpahical point (GeoPoint)
 * IS IN a polygon. While you can express arbitrary presence assertions thanks to the recursive zkSNARK nature of the .AND and .OR
 * methods, in order to express your geolocation as being inside of certain polygons, and outside of certain polygons you would require
 * two `GeoPointInPolygonCircuit` proofs.
 *
 * As such, while `GeoPointInPolygonCircuit` allows for a very powerful and flexible expression of private geolocation proofs, expressing
 * and iterperting multidimensional proofs introduces semanthic complexity.
 *
 * In order to ensure a more secure, intuitve and easy to use system, `GeoPointInOrOutOfPolygonCircuit` allows for the expression of
 * wether a given geogrpahical point (GeoPoint) IS IN a list of polygons, and IS OUT OF a list of polygons.
 *
 * This circuit requires for both, the inside and outside polygon commitments to be present. It is not a possible to create a
 * `GeoPointInOrOutOfPolygonCircuitProof` by with only an inside polygon commitment, or only an outside polygon commitment. For this, you
 * should use `GeoPointInPolygonCircuitProof`. Such a requirement is a feature by design. In a Zero-Knowledge authenticated and private geolocation proof,
 * security is paramount (WOW, security is important in a security-oriented product. Mind blown! 😂).
 *
 * As such, a careful design for the Zero-Knowledge circuits is necessary. If `GeoPointInOrOutOfPolygonCircuit` allowed for the creation of a proof
 * with only an inside polygon commitment, or only an outside polygon commitment, then it would require us to introduce "placeholder" values.
 * For example, we could use the placeholder of value 0 for the commitment that is not present. However, this opens up this proof to a subtle
 * collision attack, albeit extremely an extremely unlikely one. It would allow for creation of private geolocation proofs which can be interperted
 * as either abscence, or a presence for a sequence of polygons whose joint hash is 0. Although this is extremely, extremely, extremely unlikely and
 * difficult to achieve, such a design decision maintains the security of zkLocus at the maximum level. We considered a few alternatives as well:
 *
 * 1. Add two new booleans, e.g. `isInsidePolygonPresent` and `isOutsidePolygonPresent`. This would increase the public output of the proof by almost twice! The complexity and the time to verify the proof
 * is directly affected by the size of the public output. While we can optimize this by fitting both values into a single field, this would add computational complexity
 * to the cirucit, resulting in a performance reduction, albeit possibly to a smaller extent.
 *
 * 2. Add nonces. If everything is nonced, the probabily of collision is reduced, but it would add unecessary complexity. Applying nonces
 * would be more efficient to do after performing all of the necessary ZK computations, and before sharing the proof.
 *
*/

export const GeoPointInOrOutOfPolygonCircuit = ZkProgram({
    name: "Geo Point In Or Out Of Polygon Circuit",

    publicOutput: GeoPointInOutPolygonCommitment,

    methods: {
        fromPointInPolygonProofs: {
            privateInputs: [
                GeoPointInPolygonCircuitProof, // inside of polygon(s)
                GeoPointInPolygonCircuitProof, // outside of polgyon(s)
            ],
            method: fromPointInPolygonProofs,
        },

        /**
         * Extension is only possible for an existing proof. This is by design, for both, security, and opitmization reasons.
         */
        extendWithPointInPolygonProof: {
            privateInputs: [
                (SelfProof<Empty, GeoPointInOutPolygonCommitment>),
                GeoPointInPolygonCircuitProof,
            ],
            method: extendWithPointInPolygonProof,
        },
    },
});

export class GeoPointInOrOutOfPolygonCircuitProof extends ZkProgram.Proof(GeoPointInOrOutOfPolygonCircuit) {}
