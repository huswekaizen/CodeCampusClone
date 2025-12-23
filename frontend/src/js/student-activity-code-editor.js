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

// 1️⃣ Fetch activity from backend
let activityTestCases = [];
let activityDefaultCode = "";

async function loadActivity(activityId) {
  try {
    const res = await fetch(`http://localhost:5000/api/activities/${activityId}`);
    const data = await res.json();

    activityTestCases = data.testCases || [];
    activityDefaultCode = data.defaultCode || "// Write JS here\nconsole.log('Hello');"


    // Set editor default code
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: activityDefaultCode }
    });

  } catch (err) {
    output.textContent = "❌ Failed to load activity: " + err.message;
  }
}

// Load your activity on page load
loadActivity(localStorage.getItem("selectedActivityId")); // replace with actual ID

// 2️⃣ Run button logic
document.getElementById("runBtn").addEventListener("click", () => {
  output.textContent = "";
  const code = editor.state.doc.toString();

  try {
    // Wrap user code so it captures console.log and test inputs
    const wrapper = new Function(`
      const console = { log: (...args) => { window.output.textContent += args.join(' ') + '\\n'; } };
      return (...args) => {
        let result;
        try {
          // Use eval to execute code with arguments
          result = eval(\`(${code})(...args)\`);
        } catch (err) {
          throw err;
        }
        return result;
      };
    `);

    const userFn = wrapper();

    let passed = 0;

    activityTestCases.forEach((test, index) => {
      let result;
      try {
        result = userFn(...test.input);
      } catch (err) {
        output.textContent += `❌ Test ${index + 1} runtime error: ${err.message}\n`;
        return;
      }

      if (JSON.stringify(result) === JSON.stringify(test.expected)) {
        passed++;
        output.textContent += `✅ Test ${index + 1} passed\n`;
      } else {
        output.textContent += `❌ Test ${index + 1} failed\n`;
        output.textContent += `Expected: ${test.expected}, Got: ${result}\n`;
      }
    });

    output.textContent += `\n${passed}/${activityTestCases.length} tests passed.`;

  } catch (err) {
    output.textContent = "❌ Runtime error: " + err.message;
  }
});
