import { EditorView, basicSetup }
  from "https://cdn.jsdelivr.net/npm/codemirror@6/dist/codemirror.min.js";

import { javascript }
  from "https://cdn.jsdelivr.net/npm/@codemirror/lang-javascript@6/dist/index.js";

const editor = new EditorView({
  parent: document.getElementById("editor"),
  doc: "// Write your JavaScript here\nconsole.log('Hello world');",
  extensions: [basicSetup, javascript()]
});

// Output box
const outputBox = document.getElementById("output");

// Run button
document.getElementById("runBtn").addEventListener("click", () => {
  outputBox.textContent = ""; // clear prev output

  const userCode = editor.state.doc.toString();

  try {
    // Capture console.log
    const originalLog = console.log;
    console.log = (...msgs) => {
      outputBox.textContent += msgs.join(" ") + "\n";
    };

    // Execute code
    new Function(userCode)();

    // Restore console.log
    console.log = originalLog;

  } catch (err) {
    outputBox.textContent += "Error: " + err.message;
  }
});
