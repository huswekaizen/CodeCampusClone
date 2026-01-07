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
let sampleTests = [];
let validationTests = [];

let activityDefaultCode = "";

async function loadActivity(activityId) {
  try {
    const res = await fetch(`http://localhost:5000/api/activities/${activityId}`);
    const data = await res.json();

    sampleTests = data.sampleTests || [];
    validationTests = data.validationTests || [];

  } catch (err) {
    output.textContent = "❌ Failed to load activity: " + err.message;
  }
}

// Load your activity on page load
loadActivity(localStorage.getItem("selectedActivityId")); // replace with actual ID

const submitBtn = document.getElementById("submitBtn");
submitBtn.disabled = true; // Disable submit button initially

const instructionBtn = document.querySelector(".instruction-btn");
const outputBtn = document.querySelector(".output-btn");

const instructionPanel = document.getElementById("instruction");
const outputPanel = document.getElementById("output");

// 2️⃣ Run button logic
document.getElementById("runBtn").addEventListener("click", () => {

  outputBtn.classList.add("active");
  instructionBtn.classList.remove("active");

  outputPanel.classList.add("active");
  instructionPanel.classList.remove("active");

  const output = document.getElementById("output");
  output.innerHTML = "";

  const code = editor.state.doc.toString();
  window.output = output;

  try {
    const wrapper = new Function(`
      const console = {
        log: (...args) => window.output.textContent += args.join(" ") + "\\n"
      };
      ${code}
      if (typeof solution !== "function") {
        throw new Error("You must define a function named solution");
      }
      return solution;
    `);

    const userFn = wrapper();

    let allPassed = true;
    let firstFailure = null;

    // === RUN TESTS ===
    for (let i = 0; i < sampleTests.length; i++) {
      const test = sampleTests[i];
      let result;

      try {
        result = userFn(...test.input);
      } catch (err) {
        allPassed = false;
        firstFailure = {
          index: i,
          error: err.message
        };
        break;
      }

      if (JSON.stringify(result) !== JSON.stringify(test.expected)) {
        allPassed = false;
        firstFailure = {
          index: i,
          expected: test.expected,
          got: result
        };
        break;
      }
    }

    // === RENDER UI ===
    if (allPassed) {
      sampleTests.forEach((_, index) => {
        const testDiv = document.createElement("div");
        testDiv.classList.add("test-case");
        testDiv.innerHTML =
          `<div class="test-header pass">✅ Test ${index + 1} passed</div>`;
        submitBtn.disabled = false; // Enable submit button if all tests pass
        submitBtn.style.backgroundColor = "#08c91bca";
        output.style.border = ".5px solid green";
        output.style.borderRadius = "10px";
        output.appendChild(testDiv);
      });

      const summaryDiv = document.createElement("div");
      summaryDiv.classList.add("test-summary", "pass");
      summaryDiv.textContent = "🎉 All tests passed. Kata completed.";
      output.appendChild(summaryDiv);

    } else {
      const failDiv = document.createElement("div");
      failDiv.classList.add("test-case");

      if (firstFailure.error) {
        failDiv.innerHTML = `
          <div class="test-header fail">
            ❌ Test ${firstFailure.index + 1} error
          </div>
          <div class="test-box">
            <span class="content">${firstFailure.error}</span>
          </div>
        `;
      } else {
        failDiv.innerHTML =
          `<div class="test-header fail">❌ Test ${firstFailure.index + 1} failed</div>` +
          `<div class="test-box"><span class="label">Expected:</span><span class="content">${firstFailure.expected}</span></div>` +
          `<div class="test-box"><span class="label">Got:</span><span class="content">${firstFailure.got}</span></div>`;
        output.style.border = ".5px solid rgb(169, 72, 72)";
        output.style.borderRadius = "10px";
        submitBtn.disabled = true; // Keep submit button disabled if tests fail
      }

      output.appendChild(failDiv);

      const summaryDiv = document.createElement("div");
      summaryDiv.classList.add("test-summary", "fail");
      summaryDiv.textContent = "❌ Tests failed. Kata not completed.";
      output.appendChild(summaryDiv);
    }

  } catch (err) {
    output.textContent += "\n❌ Runtime error: " + err.message + "\n";
    output.style.border = ".5px solid rgb(169, 72, 72)";
    output.style.borderRadius = "10px";
  }
});
