import type ExecutionResult from "../model/executionResult";

function parseResult(result: ExecutionResult) {
  return (
    <>
      {result.getMessage().split("\n").map((text, index) => <p key={index}>{text}</p>)}
      <ul>
        <li>Instructions ran: {result.getInstructionCount()}</li>
        <li>Final register value: {result.getRegister()}</li>
        <li>Final program counter: {result.getProgramIndex()}</li>
      </ul>
      <p>Modified memory cells:</p>
      {result.getModifiedMemory().size > 0 ? (
        <table className="memoryView">
          <thead>
            <tr>
              <th>Address</th>
              <th>Contents</th>
            </tr>
          </thead>
          <tbody>
            {[...result.getModifiedMemory()].sort(([a], [b]) => a - b).map(([address, content]) => {
              return (
                <tr key={address}>
                  <td>{address}</td>
                  <td>{content}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No memory cells were modified</p>
      )}
    </>
  );
}

export default function ResultArea({
  result = null,
}: {
  result?: ExecutionResult | null;
}) {
  const defaultMessage =
    "No programs run yet. Once you run a program, the result of its execution will be shown here.";

  return (
    <div className="vert">
      <h2>Program execution result</h2>
      {result ? parseResult(result) : <p className="minor">{defaultMessage}</p>}
    </div>
  );
}
