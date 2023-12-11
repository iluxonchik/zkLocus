/*
    Interface for all provers. A prover must contain the Prove property, which will contain the prover's methods.
    
    Intially, I had the idea of enforcing an IZKProver to only support one proof type, in order to promote separation
    of resposibilities, but then realized that the goal of the API is to provide an intuitive bridge from every
    type to every type, every proof to every other proof, without exposing the underlying zkSNARKs implementation
    indirectly in that part of the API.
*/
export interface IZKProver {
    Prove: Object;
}
