import { useState } from "react";
import "../style/layout.css";
import "../style/style.css";

import ProgramArea from "./ProgramArea";
import ResultArea from "./ResultArea";
import ExecutionResult from "../model/executionResult";
import Simulation from "../model/simulation";

function Header() {
  return (
    <header>
      <h1>Operating Systems V0 simulator</h1>
    </header>
  );
}

export default function App() {
  const [result, setResult] = useState<ExecutionResult | null>(null);

  function runProgram(programText: string) {
    try {
      setResult(new Simulation(programText).runSimulation());
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  }

  return (
    <>
      <Header />
      <div className="horizontal">
        <ProgramArea onRun={runProgram} />
        <ResultArea result={result} />
      </div>
    </>
  );
}
