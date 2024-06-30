const axios = require('axios');
const { testCases } = require('./data/testJson');
const { describe, expect, it } = require('@jest/globals');

const ENDPOINT = process.env.ENDPOINT || 'http://localhost:3000/api/execute/';

describe('Tests', () => {
    for (const testCase of testCases) {
        it(testCase.name, async () => {
            const response = await axios.post(ENDPOINT, testCase.reqObject);
            
            if (typeof response.data.output === 'object') {
                expect(response.data.output.score).toBeDefined();
                expect(response.data.output.rationale.positives).toBeDefined();
                expect(response.data.output.rationale.negatives).toBeDefined();
                expect(response.data.output.points).toBeDefined();
            } else {
                expect(response).toHaveProperty('data.output', testCase.expectedResponse.val);
            }
            
            expect(response).toHaveProperty('status', testCase.expectedResponse.status);
            expect(response).toHaveProperty('data.error', testCase.expectedResponse.error);
        }, 15000);
    }

    
    it('Valid request with empty input', async () => {
        const response = await axios.post(ENDPOINT, { input: "" });
        expect(response.status).toBe(400); // Expecting a Bad Request status
        expect(response.data.error.message).toBe("No input provided");
    });

    it('Valid request with null input', async () => {
        const response = await axios.post(ENDPOINT, { input: null });
        expect(response.status).toBe(400); // Expecting a Bad Request status
        expect(response.data.error.message).toBe("Format input invalid");
    });

    it('Valid request with unexpected data type for input', async () => {
        const response = await axios.post(ENDPOINT, "Input Invalid data type");
        expect(response.status).toBe(400); 
        expect(response.data.error.message).toBe("Data format request invalid");
    });

    it('Valid request with missing input property', async () => {
        const response = await axios.post(ENDPOINT, {});
        expect(response.status).toBe(400); 
        expect(response.data.error.message).toBe("Missing requirement in requested object");
    });

    it('Server error due to internal server issue', async () => {
        const response = await axios.post(ENDPOINT);
        expect(response.status).toBe(500); 
        expect(response.data.error.message).toBe("Internal server issue");
    });

    it('Network error due to connection issues', async () => {
        try {
            await axios.post('http://nonexistentendpoint.example.com', { input: "Some input" });
            fail('Expected network error');
        } catch (error) {
            expect(error.code).toEqual('Connection issue'); 
        }
    });

    it('Valid request with large input size', async () => {
        
        const largeInput = "a".repeat(1000000);
        const response = await axios.post(ENDPOINT, { input: largeInput });
        expect(response.status).toBe(200); 
        expect(response.data.output).toBeDefined();
    });
});

