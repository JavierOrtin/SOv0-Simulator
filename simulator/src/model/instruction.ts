import type Simulation from "./simulation";
import { getBits, operand8Bits, signExtend8 } from "./utils";

export abstract class Instruction {

    protected static instructionCode : number;
    protected static regEx : RegExp;

    protected op1 : number = 0;
    protected op2 : number = 0;

    static encode(line : string) {
        const match = this.regEx.exec(line);
        if(!match) throw new Error("Invalid encoding");

        const op1 = operand8Bits(parseInt(match[1]));
        const op2 = operand8Bits(parseInt(match[2]));
        
        return (this.instructionCode << 16) | op1 << 8 | op2;
    }

    static lineMatch(line : string) {
        return this.regEx.test(line);
    }

    static valueMatch(value : number) {
        return getBits(value, 3, 16) == this.instructionCode;
    }

    abstract runInstruction(simulation : Simulation) : void;
}

export interface InstructionClass {
    lineMatch(line : string) : boolean;
    encode(line : string) : number;
    valueMatch(value : number) : boolean;
    decode(value : number) : Instruction;
}

export class HaltInstruction extends Instruction {
    protected static regEx: RegExp = /^HALT\s*$/;
    protected static instructionCode: number = -1;


    static encode(line : string) {
        if(!this.lineMatch(line)) throw new Error("Invalid encoding");
        return -1;
    }

    static valueMatch(value: number): boolean {
        return value == -1;
    }

    static decode(value : number) {
        if(!this.valueMatch(value)) throw new Error("Invalid decoding");
        return new HaltInstruction();
    }

    runInstruction(simulation: Simulation): void {
        simulation.halt();
    }
}

export class NopInstruction extends Instruction {
    protected static regEx: RegExp = /^NOP\s*$/;
    protected static instructionCode: number = 0;


    static decode(value : number) {
        if(!this.valueMatch(value)) throw new Error("Invalid decoding");
        return new NopInstruction();
    }

    runInstruction(simulation: Simulation): void {
        simulation.incrementProgramIndex();
    }
}

export class AddInstruction extends Instruction {
    protected static regEx: RegExp = /^ADD (-?\d+) (-?\d+)\s*$/;
    protected static instructionCode: number = 1;

    private constructor(op1 : number, op2 : number) {
        super();
        this.op1 = op1;
        this.op2 = op2;
    } 

    static decode(value : number) {
        if(!this.valueMatch(value)) throw new Error("Invalid decoding");

        return new AddInstruction(signExtend8(getBits(value, 8, 8)),
            signExtend8(getBits(value, 8,0)));
    }

    runInstruction(simulation: Simulation): void {
        simulation.setRegisterAddition(this.op1, this.op2);
        simulation.incrementProgramIndex();
    }
}

export class ShiftInstruction extends Instruction {
    protected static regEx: RegExp = /^SHIFT (-?\d+)\s*$/;
    protected static instructionCode: number = 2;

    private constructor(op1 : number) {
        super();
        this.op1 = op1;
    }

    static decode(value : number) {
        if(!this.valueMatch(value)) throw new Error("Invalid decoding");

        return new ShiftInstruction(signExtend8(getBits(value, 8, 8)));
    }

    runInstruction(simulation: Simulation): void {
        simulation.shiftRegister(this.op1);
        simulation.incrementProgramIndex();
    }
}

export class JumpInstruction extends Instruction {
    protected static regEx: RegExp = /^JUMP (-?\d+)\s*$/;
    protected static instructionCode: number = 3; 
    
    private constructor(op1 : number) {
        super();
        this.op1 = op1;
    }

    static decode(value : number) {
        if(!this.valueMatch(value)) throw new Error("Invalid decoding");

        return new JumpInstruction(signExtend8(getBits(value, 8, 8)));
    }

    runInstruction(simulation: Simulation): void {
        simulation.incrementProgramIndex(this.op1);
    }
}

export class ZJumpInstruction extends Instruction {
    protected static regEx: RegExp = /^ZJUMP (-?\d+)\s*$/;
    protected static instructionCode: number = 4;

    private constructor(op1 : number) {
        super();
        this.op1 = op1;
    }

    static decode(value : number) {
        if(!this.valueMatch(value)) throw new Error("Invalid decoding");

        return new ZJumpInstruction(signExtend8(getBits(value, 8, 8)));
    }

    runInstruction(sim: Simulation): void {
        if(sim.isRegisterZero()) sim.incrementProgramIndex(this.op1);
        else sim.incrementProgramIndex();
    }
        
}

export class ReadInstruction extends Instruction {
    protected static regEx: RegExp = /^READ (-?\d+)\s*$/;
    protected static instructionCode: number = 5;

    private constructor(op1 : number) {
        super();
        this.op1 = op1;
    }

    static decode(value : number) {
        if(!this.valueMatch(value)) throw new Error("Invalid decoding");

        return new ReadInstruction(getBits(value, 8, 8));
    }

    runInstruction(simulation: Simulation): void {
        simulation.readMemoryContents(this.op1);
        simulation.incrementProgramIndex();
    }
}

export class WriteInstruction extends Instruction {
    protected static regEx: RegExp = /^WRITE (-?\d+)\s*$/;
    protected static instructionCode: number = 6;

    private constructor(op1 : number) {
        super();
        this.op1 = op1;
    }

    static decode(value : number) {
        if(!this.valueMatch(value)) throw new Error("Invalid decoding");

        return new WriteInstruction(getBits(value, 8, 8));
    }

    runInstruction(simulation: Simulation): void {
        simulation.writeMemoryContents(this.op1);
        simulation.incrementProgramIndex();
    }
}

export class IncInstruction extends Instruction {
    protected static regEx: RegExp = /^INC (-?\d+)\s*$/;
    protected static instructionCode: number = 7;

    private constructor(op1 : number) {
        super();
        this.op1 = op1;
    }

    static decode(value : number) {
        if(!this.valueMatch(value)) throw new Error("Invalid decoding");

        return new IncInstruction(signExtend8(getBits(value, 8, 8)));
    }

    runInstruction(simulation: Simulation): void {
        simulation.incrementRegister(this.op1);
        simulation.incrementProgramIndex();
    }
}