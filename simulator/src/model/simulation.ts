import ExecutionResult from "./executionResult";
import { AddInstruction, HaltInstruction, IncInstruction, JumpInstruction, NopInstruction, ReadInstruction, ShiftInstruction, WriteInstruction, ZJumpInstruction, type InstructionClass } from "./instruction";
import { getCodeFromLine, isBlank, operand9Bits } from "./utils";

export default class Simulation {
    
    static #instructionOrder : InstructionClass[] = [HaltInstruction, AddInstruction, ShiftInstruction, 
        JumpInstruction, ZJumpInstruction, ReadInstruction, WriteInstruction, IncInstruction, NopInstruction
    ];

    #memoryBoard : Array<number>;
    #running : boolean;
    #programIndex : number;
    #register : number;
    #maxInstructions : number;
    #modifiedCells: Map<number, number>;


    constructor(programText : string, memoryExcessSize = 60, maxIns = 1e5) {
        if(memoryExcessSize <= 0) throw new Error("Invalid memory excess size");
        if(maxIns <= 0) throw new Error("Invalid max instruction number");
        

        this.#memoryBoard = [
            ...this.#parseInstructions(programText.split("\n")),
            ...new Array(memoryExcessSize).fill(0)
        ];

        this.#running = true;
        this.#programIndex = 0;
        this.#register = 0;
        this.#maxInstructions = maxIns;
        this.#modifiedCells = new Map<number,number>();
    }

    #parseInstructions(lines : string[]) : number[] {
        const parsedLines : number[] = [];
        let lineN = 0;
        for (const line of lines.map(getCodeFromLine)) {
            lineN++;
            if(isBlank(line)) continue;
            let isParsed = false;
            for(const kind of Simulation.#instructionOrder) {
                if(kind.lineMatch(line)) {
                    parsedLines.push(kind.encode(line));
                    isParsed = true;
                    break;
                }
            }
            if(!isParsed) throw new Error(`Invalid program instruction in line ${lineN}`)
        }        
        return parsedLines;
    }

    runSimulation() {
        let message = "";
        let goingRight = true;
        let instructionsRun;
        for(instructionsRun = 0; instructionsRun < this.#maxInstructions && this.#running && goingRight; instructionsRun++) {
            const instructionValue = this.#memoryBoard[this.#programIndex];
            let isParsed = false;
            const lineN = this.#programIndex;
            for(const kind of Simulation.#instructionOrder) {
                if(kind.valueMatch(instructionValue)) {
                    isParsed = true;
                    const decoded = kind.decode(instructionValue);
                    try {
                        decoded.runInstruction(this);
                    } catch (err) {
                        goingRight = false;
                        message = `Error running line ${lineN}:\n${(err instanceof Error) ? err.message : ""}`;
                    }
                    break;
                }
            }
            if(!isParsed) {
                goingRight = false;
                message = `Error running line ${lineN}:\nInvalid instruction value: could not be fetched`;
            }
        }
        if(goingRight) message = this.#running ? "Maximum instruction number reached" : "HALT instruction reached";

        return new ExecutionResult(message, this.#register, this.#programIndex,
            this.#modifiedCells, instructionsRun);
    }

    incrementProgramIndex(offset : number = 1) {
        try {
            this.#programIndex = operand9Bits(offset + this.#programIndex);
        } catch(err) {
            throw new Error("Program index set out of memory bounds");
        }
    }

    incrementRegister(offset : number = 1) {
        this.#register = operand9Bits(offset + this.#register);
    }

    halt() {
        this.#running = false;
    }

    readMemoryContents(address : number) {
        if(address < 0 || address >= this.#memoryBoard.length) throw new Error("Address out of memory range");
        this.#register = this.#memoryBoard[address];
    }

    writeMemoryContents(address : number) {
        if(address < 0 || address >= this.#memoryBoard.length) throw new Error("Address out of memory range");
        this.#memoryBoard[address] = this.#register;
        this.#modifiedCells.set(address, this.#register);
    }

    shiftRegister(amount: number) {
        if (amount > 0) {
            this.#register = operand9Bits(this.#register >>> amount);
        } else if (amount < 0) {
            this.#register = operand9Bits(this.#register << -amount);
        }
    }

    setRegisterAddition(op1 : number, op2 : number) {
        this.#register = operand9Bits(op1 + op2);
    }

    isRegisterZero() {
        return this.#register == 0;
    }

}