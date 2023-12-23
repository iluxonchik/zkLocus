import axios from 'axios';
import { ZKLatitude, ZKLongitude } from '../../api/Models';

/**
 * Client for interacting with the HTTP Oracle service.
 */
export default class OracleClient {
    private oracleEndpoint: string;

    constructor(oracleEndpoint: string) {
        this.oracleEndpoint = oracleEndpoint;
    }

    async fetchSignatureAndPublicKey(latitude: number | ZKLatitude, longitude: number | ZKLongitude): Promise<{ signature: string; publicKey: string }> {
        try {

            if (typeof latitude !== 'number') {
                latitude = latitude.normalized;
            }

            if (typeof longitude !== 'number') {
                longitude = longitude.normalized;
            }
            const response = await axios.post(this.oracleEndpoint, { latitude, longitude });
            return response.data; // Assuming the response has signature and publicKey
        } catch (error) {
            throw new Error(`Failed to fetch data from Oracle: ${error}`);
        }
    }
}
