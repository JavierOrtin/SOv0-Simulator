export default class ExecutionResult {
    #register : number;
    #programIndex : number;
    #modifiedMemory : Readonly<Map<number,number>>;
    #instructionCount : number;
    #message : string;

    constructor(message : string, register : number, programIndex : number,
        modifiedMemory : Map<number, number>, instructionCount : number) {

        this.#message = message;
        this.#register = register;
        this.#programIndex = programIndex;
        this.#modifiedMemory = Object.freeze(modifiedMemory);
        this.#instructionCount = instructionCount;
    }

    getMessage() {
        return this.#message;
    }

    getRegister() {
        return this.#register;
    }

    getProgramIndex() {
        return this.#programIndex;
    }

    getModifiedMemory() {
        return this.#modifiedMemory;        
    }

    getInstructionCount() {
        return this.#instructionCount;
    }

}