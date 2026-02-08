import { useState } from "react";

export default function ProgramArea({onRun} : {onRun : (s : string) => void}) {
  const [programText, setProgramText] = useState("");

  let wasWrong = false;

  function downloadProgram() {
    const blob = new Blob([programText], { type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "program.so";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function loadProgram(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      wasWrong = true;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        wasWrong = false;
        setProgramText(result);
      } else {
        wasWrong = true;
      }
    };

    reader.readAsText(file);
  }

  return (
    <div className="vert">
    <h2>Program editor</h2>
      <textarea
        className="programEditor"
        onChange={(e) => setProgramText(e.target.value)}
        value={programText}
      />
      <div className="controls">
        <div className="vert">
        {wasWrong && <p>Error reading file contents</p>}
        <label htmlFor="loader">Load program</label>
        <input
          type="file"
          accept=".so"
          id="loader"
          onChange={(e) => loadProgram(e)}
          />
        </div>
        <button onClick={downloadProgram}>Download program</button>
        <button onClick={() => onRun(programText)}>Run</button>        
      </div>
    </div>
  );
}
