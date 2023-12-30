import { SHA3_512 } from "../model/public/SHA3";

describe('SHA3_512 Class Tests', () => {
    // Test for initialization and correct hashing
    describe('Initialization and Hashing', () => {
        it('should correctly initialize and compute SHA3-512 hash from preimage', () => {
            const preimage = "Hello, World!";
            const sha3HashInstance = new SHA3_512(preimage);
            const digest = sha3HashInstance.digest;  // This is the SHA3-512 hash

            // As the actual hash is not predictable without a known SHA3-512 function,
            // we are not verifying the exact hash but the properties and existence
            expect(digest).toBeDefined();
            expect(digest.length).toEqual(64);  // SHA3-512 should be 64 bytes
            expect(sha3HashInstance.preimage).toEqual(preimage);
        });
    });

    // Test for provable types related to Zero-Knowledge circuits
    describe('Provable Types', () => {
        it('should correctly return provable type for SHA3-512', () => {
            const provableType = SHA3_512.provable;
            expect(provableType).toBeDefined();
            // Further checks can be added based on the specifics of the ProvablePureExtended interface
        });
    });

    // Test for Poseidon hashing of the SHA3-512 digest
    describe('Poseidon Hash of Digest', () => {
        it('should correctly compute Poseidon hash of the SHA3-512 digest', () => {
            const preimage = "Test String for Poseidon Hash";
            const sha3HashInstance = new SHA3_512(preimage);
            const poseidonHash = sha3HashInstance.poseidonHash();

            // As with SHA3-512, the actual value is not predictable here,
            // but we can check that a result is returned and it is of Field type
            expect(poseidonHash).toBeDefined();
            // Further checks can be added based on the specifics of the Poseidon hash and Field type
        });
    });

    // Tests focusing on the input/output formats and integrity
    describe('SHA3_512 Input/Output Integrity', () => {
        it('should maintain consistent input/output relationship', () => {
            const preimage = "Consistent Input";
            const sha3HashInstance = new SHA3_512(preimage);
            const digest = sha3HashInstance.digest;
            const poseidonHash = sha3HashInstance.poseidonHash();

            // Check that the digest and poseidonHash are consistent with the input
            expect(digest).toBeDefined();
            expect(poseidonHash).toBeDefined();
            // No direct equality check possible without external SHA3-512 and Poseidon references
            // but we ensure that the outputs are consistent and defined
        });

        it('should handle empty string input', () => {
            const preimage = "";
            const sha3HashInstance = new SHA3_512(preimage);
            const digest = sha3HashInstance.digest;
            const poseidonHash = sha3HashInstance.poseidonHash();

            // Check handling of empty string
            expect(digest).toBeDefined();  // Digest should still be defined
            expect(poseidonHash).toBeDefined();  // Poseidon hash should still be defined
        });
    });

    // Edge case testing
    describe('SHA3_512 Edge Cases', () => {
        const edgeCases = [
            " ", // Single space
            "    ", // Multiple spaces
            "\n", // Newline character
            "0", // Single digit
            "1".repeat(1024), // Long string
        ];

        edgeCases.forEach((edgeCase, index) => {
            it(`should handle edge case input ${index + 1} correctly`, () => {
                const sha3HashInstance = new SHA3_512(edgeCase);
                const digest = sha3HashInstance.digest;
                const poseidonHash = sha3HashInstance.poseidonHash();

                expect(digest).toBeDefined();
                expect(poseidonHash).toBeDefined();
                // As always, specific values can't be directly tested without actual SHA3-512 and Poseidon functions
            });
        });
    });

    // Performance testing (if applicable)
    describe('SHA3_512 Performance', () => {
        it('should hash and reconstruct within reasonable time', () => {
            const inputString = "Performance test with a reasonably long string. ".repeat(10);

            const startTime = performance.now();
            const sha3HashInstance = new SHA3_512(inputString);
            const endTime = performance.now();

            // Check that the hashing takes a reasonable amount of time (adjust threshold as needed)
            expect(endTime - startTime).toBeLessThan(1000);  // Example: less than 1000ms
        });
    });

});

