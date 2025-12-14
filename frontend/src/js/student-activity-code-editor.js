import { EditorView, basicSetup } from "https://esm.sh/codemirror";
import { javascript } from "https://esm.sh/@codemirror/lang-javascript";
import { linter } from "https://esm.sh/@codemirror/lint";
import { HighlightStyle, syntaxHighlighting } from "https://esm.sh/@codemirror/language";
import { tags } from "https://esm.sh/@lezer/highlight";

function jsSyntaxLinter() {
  return linter(view => {
    const diagnostics = [];
    const code = view.state.doc.toString();

    try {
      new Function(code);
    } catch (err) {
      diagnostics.push({
        from: 0,
        to: view.state.doc.length,
        severity: "error",
        message: err.message || "Syntax error"
      });
    }

    return diagnostics;
  });
}

const syntaxColors = HighlightStyle.define([
  { tag: tags.keyword, color: "#ff7b72" },
  { tag: tags.string, color: "#a5d6ff" },
  { tag: tags.number, color: "#79c0ff" },
  { tag: tags.comment, color: "#7a88a8", fontStyle: "italic" },
  { tag: tags.variableName, color: "#e6eefb" },
  { tag: tags.function(tags.variableName), color: "#d2a8ff" }
]);


const darkEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "#0f1529",
    color: "#e2e2e2ff"
  },

  ".cm-content": {
    caretColor: "#64b2ff"
  },

  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "#64b2ff"
  },

  ".cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(100,178,255,0.25)"
  },

  ".cm-gutters": {
    backgroundColor: "#0f1529",
    borderRight: "1px solid #9797971a",
    color: "#7a88a8",
  },

  ".cm-activeLine": {
    backgroundColor: "rgba(48, 115, 221, 0.1)"
  },

  ".cm-activeLineGutter": {
    backgroundColor: "rgba(100,178,255,0.15)",
    color: "#64b2ff"
  },

  ".cm-diagnostic-error": {
    borderLeft: "3px solid #ff6b6b"
  }
}, { dark: true });

const editor = new EditorView({
  parent: document.getElementById("editor"),
  doc: "// Write JS here\nconsole.log('Hello');",
  extensions: [
    basicSetup,
    javascript(),
    jsSyntaxLinter(),
    darkEditorTheme,
    syntaxHighlighting(syntaxColors)
  ]
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

    if (output.textContent === "") {
      output.textContent = "✅ Code executed successfully (no output).";
    }
    
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
});
