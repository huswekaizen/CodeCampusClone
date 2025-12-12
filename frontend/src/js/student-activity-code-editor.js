import { EditorView, basicSetup } 
  from "https://esm.sh/@codemirror/basic-setup";

import { javascript } 
  from "https://esm.sh/@codemirror/lang-javascript";

const editor = new EditorView({
  parent: document.getElementById("editor"),
  doc: "// Write JS here\nconsole.log('Hello');",
  extensions: [basicSetup, javascript()]
});

const output = document.getElementById("output");

document.getElementById("runBtn").addEventListener("click", () => {
  output.textContent = "";

  const code = editor.state.doc.toString();

  try {
    const originalLog = console.log;
    console.log = (...msg) => output.textContent += msg.join(" ") + "\n";
    
    new Function(code)();

    console.log = originalLog;
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
});
