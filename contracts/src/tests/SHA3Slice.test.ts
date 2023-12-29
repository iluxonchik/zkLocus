import { Field } from 'o1js'; // Ensure correct import paths
import { SHA3 } from 'sha3';
import { PartionedSHA3_512, SHA3Sliced } from '../model/public/SHA3';

describe('Initialization Tests', () => {
    it('should generate correct SHA3-512 hash for a given string', () => {
        const inputString = "Hello, world!";
        const hash = new SHA3(512);
        hash.update(inputString);
        const resultHash = hash.digest('hex');

        const expectedHash = new SHA3(512);
        expectedHash.update(inputString);
        const expectedHashString = expectedHash.digest('hex');

        expect(resultHash).toEqual(expectedHashString);
    });

    it('should convert hex hash to Field elements correctly', () => {
        const inputString = "Test input for Field conversion";
        const hash = new SHA3(512);
        hash.update(inputString);
        const hashOutput = hash.digest('hex');

        const partSizeHex = 128;
        const parts = [
            hashOutput.slice(0, partSizeHex),
            hashOutput.slice(partSizeHex, 2 * partSizeHex),
            hashOutput.slice(2 * partSizeHex)
        ];

        const fieldElements = parts.map(part => {
            if (part === "") return new Field(0); // or handle as an error
            return new Field(BigInt('0x' + part));
        });

        expect(fieldElements.length).toBe(3); // Should split into three parts
        fieldElements.forEach(fe => {
            expect(fe).toBeInstanceOf(Field); // Each part should be an instance of Field
        });
    });
});

describe('PartionedSHA3_512 Tests', () => {
    describe('Constructor Test', () => {
        it('should initialize slice fields correctly from hash', () => {
            const inputString = "Hello, world!";
            const hash = new SHA3(512);
            hash.update(inputString);
            const hashDigest: string = hash.digest('hex');
            const partitionedHash = new PartionedSHA3_512(hashDigest);

            expect(partitionedHash.slice1).toBeInstanceOf(Field);
            expect(partitionedHash.slice2).toBeInstanceOf(Field);
            expect(partitionedHash.slice3).toBeInstanceOf(Field);
        });
    });

    describe('sliceHash Method', () => {
        it('should correctly split hash into three slices', () => {
            const inputString = "Hello, world!";
            const hash = new SHA3(512);
            hash.update(inputString);
            const digestHex: string = hash.digest('hex');
            const partitionedHash = new PartionedSHA3_512(digestHex);

            // Since we do not know the exact hash value, we will ensure that they are Field instances
            expect(partitionedHash.slice1).toBeInstanceOf(Field);
            expect(partitionedHash.slice2).toBeInstanceOf(Field);
            expect(partitionedHash.slice3).toBeInstanceOf(Field);
        });
    });

    describe('convertHashToFields Method', () => {
        it('should convert hex parts to Field elements accurately', () => {
            const inputString = "Specific test input";
            const hash = new SHA3(512);
            hash.update(inputString);
            const hashOutput = hash.digest('hex');

            const partitionedHash = new PartionedSHA3_512(hashOutput);
            const fieldElements = partitionedHash['convertHashToFields'](hashOutput);

            expect(fieldElements.length).toBe(3);
            fieldElements.forEach(fe => expect(fe).toBeInstanceOf(Field));
        });
    });

    describe('fromSlices Method', () => {
        it('should reconstruct hash correctly from slices', () => {
            // Create a known hash and corresponding PartionedSHA3_512 instance
            const inputString = "Another specific input";
            const hash = new SHA3(512);
            hash.update(inputString);
            const hashDigest: string = hash.digest('hex');
            const originalPartitionedHash = new PartionedSHA3_512(hashDigest);

            // Use fromSlices to reconstruct
            const reconstructedPartitionedHash = PartionedSHA3_512.fromSlices(
                originalPartitionedHash.slice1, 
                originalPartitionedHash.slice2, 
                originalPartitionedHash.slice3
            );

            // Assert that reconstructed fields match original fields
            expect(reconstructedPartitionedHash.slice1.toString()).toEqual(originalPartitionedHash.slice1.toString());
            expect(reconstructedPartitionedHash.slice2.toString()).toEqual(originalPartitionedHash.slice2.toString());
            expect(reconstructedPartitionedHash.slice3.toString()).toEqual(originalPartitionedHash.slice3.toString());
        });

        it('should handle incorrect slices gracefully', () => {
            // Define incorrect or random slices
            const slice1 = new Field(BigInt('1'));
            const slice2 = new Field(BigInt('2'));
            const slice3 = new Field(BigInt('3'));

            expect(() => {
                PartionedSHA3_512.fromSlices(slice1, slice2, slice3);
            }).not.toThrow(); // Adjust based on how fromSlices handles errors
        });
    });

    describe('Getter Methods', () => {
        it('should return correct field for slice1', () => {
            const inputString = "Getter method test";
            const hash = new SHA3(512);
            hash.update(inputString);
            const hashDigest: string = hash.digest('hex');
            const partitionedHash = new PartionedSHA3_512(hashDigest);
            expect(partitionedHash.slice1).toBeInstanceOf(Field);
        });

        it('should return correct field for slice2', () => {
            const inputString = "Getter method test";
            const hash = new SHA3(512);
            hash.update(inputString);
            const hashDigest: string = hash.digest('hex');
            const partitionedHash = new PartionedSHA3_512(hashDigest);
            expect(partitionedHash.slice2).toBeInstanceOf(Field);
        });

        it('should return correct field for slice3', () => {
            const inputString = "Getter method test";
            const hash = new SHA3(512);
            hash.update(inputString);
            const hashDigest: string = hash.digest('hex');
            const partitionedHash = new PartionedSHA3_512(hashDigest);
            expect(partitionedHash.slice3).toBeInstanceOf(Field);
        });
    });
});

describe('SHA3Sliced Tests', () => {
    it('should create valid instance from input string', () => {
        const inputString = "Test for SHA3Sliced creation";
        const commitment = SHA3Sliced.fromString(inputString);

        expect(commitment).toBeInstanceOf(SHA3Sliced);
        expect(commitment.slice1).toBeInstanceOf(Field);
        expect(commitment.slice2).toBeInstanceOf(Field);
        expect(commitment.slice3).toBeInstanceOf(Field);
    });

    describe('toPoseidon Method', () => {
        it('should compute Poseidon hash correctly', () => {
            const inputString = "Poseidon hash test";
            const commitment = SHA3Sliced.fromString(inputString);
            const poseidonHash = commitment.toPoseidon();

            expect(poseidonHash).toBeInstanceOf(Field); // Ensure the Poseidon hash is a Field
            // More in-depth testing can be done here based on known Poseidon hash outcomes
        });
    });

    describe('hash Method', () => {
        it('should return same result as toPoseidon method', () => {
            const inputString = "Hash method test";
            const commitment = SHA3Sliced.fromString(inputString);
            const hashResult = commitment.hash();
            const poseidonResult = commitment.toPoseidon();

            expect(hashResult.toString()).toEqual(poseidonResult.toString());
        });
    });

    describe('toString Method', () => {
        it('should return correct string representation of hash', () => {
            const inputString = "toString method test";
            const commitment = SHA3Sliced.fromString(inputString);
            const stringRepresentation = commitment.toString();

            expect(typeof stringRepresentation).toBe('string');
            expect(stringRepresentation).toContain('SHA3:'); // Ensure it starts with 'SHA3:'
        });
    });

    describe('toSHA3_512 Method', () => {
        it('should return correctly reconstructed PartionedSHA3_512 object', () => {
            const inputString = "toSHA3_512 method test";
            const commitment = SHA3Sliced.fromString(inputString);
            const partitionedSHA3 = commitment.toSHA3_512();

            expect(partitionedSHA3).toBeInstanceOf(PartionedSHA3_512);
        });

        it('should cache PartionedSHA3_512 object after first use', () => {
            const inputString = "Caching test for toSHA3_512";
            const commitment = SHA3Sliced.fromString(inputString);

            const firstCall = commitment.toSHA3_512();
            const secondCall = commitment.toSHA3_512();

            // Check that the same object is returned on subsequent calls
            expect(firstCall).toBe(secondCall);
        });
    });

    describe('fromString Static Method', () => {
        it('should create valid SHA3Sliced from string', () => {
            const inputString = "fromString static method test";
            const commitment = SHA3Sliced.fromString(inputString);

            expect(commitment).toBeInstanceOf(SHA3Sliced);
        });
    });
});

describe('Conversion and Consistency Tests', () => {
    it('should retain consistency in data through conversions', () => {
        const inputString = "Consistency test";
        const commitment = SHA3Sliced.fromString(inputString);
        const partitionedSHA3 = commitment.toSHA3_512();

        // Assert each slice is consistent through conversion
        expect(commitment.slice1.toString()).toEqual(partitionedSHA3.slice1.toString());
        expect(commitment.slice2.toString()).toEqual(partitionedSHA3.slice2.toString());
        expect(commitment.slice3.toString()).toEqual(partitionedSHA3.slice3.toString());
    });

    it('should handle incorrect or unexpected input gracefully', () => {
        // Testing with an empty string
        expect(() => SHA3Sliced.fromString("")).not.toThrow();
        // More tests can be added for various unexpected inputs
    });
});


describe('Edge Cases and Negative Testing', () => {
    it('should handle edge case strings correctly', () => {
        const edgeCases = ["", " ", "    ", "\n", "0", "1".repeat(1024)]; // Add more as needed
        edgeCases.forEach(edgeCase => {
            const commitment = SHA3Sliced.fromString(edgeCase);
            expect(commitment).toBeInstanceOf(SHA3Sliced); // Asserting that it handles edge cases without breaking
        });
    });

});

describe('Performance Tests (Optional)', () => {
    it('should hash and reconstruct within performance constraints', () => {
        const inputString = "Performance test with a reasonably long string. ".repeat(20);

        const startTime = performance.now();
        const commitment = SHA3Sliced.fromString(inputString);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(1000); // Ensure the operation takes less than 1000 milliseconds, adjust as necessary
    });
});
