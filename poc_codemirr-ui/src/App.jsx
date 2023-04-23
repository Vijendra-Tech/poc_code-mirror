import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import axios from "axios";
import { Buffer } from "buffer";
import OutPutDetils from "./components/Output";
import CompiledOutput from "./components/CompiledOutput";
// import "codemirror/lib/codemirror.css";
// import "codemirror/theme/darcula.css";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import Footer from "./components/Footer";

const javascriptDefault = `/**
* Problem: check tree is balanced or not.
*/

class Node {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

function isBalanced(root) {
  // Base case: empty tree is balanced
  if (!root) {
    return true;
  }

  // Check height of left and right subtrees
  const leftHeight = height(root.left);
  const rightHeight = height(root.right);

  // Check if height difference is no more than 1
  if (Math.abs(leftHeight - rightHeight) <= 1
      && isBalanced(root.left)
      && isBalanced(root.right)) {
    return true;
  }

  // Tree is not balanced
  return false;
}

function height(node) {
  // Base case: empty tree has height 0
  if (!node) {
    return 0;
  }

  // Calculate height of left and right subtrees recursively
  const leftHeight = height(node.left);
  const rightHeight = height(node.right);

  // Return the maximum height plus 1 for this node
  return Math.max(leftHeight, rightHeight) + 1;
}
const root = new Node(1);
root.left = new Node(2);
root.right = new Node(3);
root.left.left = new Node(4);
root.left.right = new Node(5);
root.right.left = new Node(6);
root.right.right = new Node(7);

console.log(isBalanced(root)); // true

`;

function App() {
  const [codes, setCode] = useState(javascriptDefault);
  const [output, setOutPut] = useState(null);

  const onChange = (value, viewUpdate) => {
    setCode(value);
  };

  const hanndleExecute = () => {
    const formData = {
      language_id: 63,
      // encode source code in base64
      source_code: Buffer.from(codes, "binary").toString("base64"),
      stdin: Buffer.from("", "binary").toString("base64"),
    };
    const options = {
      method: "POST",
      url: import.meta.env.VITE_APP_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": import.meta.env.VITE_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_APP_RAPID_API_KEY,
      },
      data: formData,
    };
    axios
      .request(options)
      .then((res) => {
        console.log("res.data", res.data);
        const token = res?.data?.token;
        checkStatusFromAPI(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response?.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);
        }
      });
  };
  const checkStatusFromAPI = async (token) => {
    const options = {
      method: "GET",
      url: import.meta.env.VITE_APP_RAPID_API_URL + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": import.meta.env.VITE_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_APP_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response?.data?.status?.id;

      // Processed - we have a result
      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatusFromAPI(token);
        }, 2000);
        return;
      }
      setOutPut(response.data);
      //showSuccessToast(`Compiled Successfully!`);
      console.log("response.data", response.data);
      return;
    } catch (error) {}
  };

  return (
    <>
      <div className="left-20 right-30 top-5 ml-10 mt-10 grid grid-cols-2 gap-2">
        <h4 class="text-3xl font-semibold">JavaScript Code Editor</h4>
        <div className="grid-cols-4">
          <button
            className="bg-black hover:bg-black text-white font-bold py-2 px-4 rounded"
            onClick={() => hanndleExecute()}
          >
            Compile and Execute
          </button>
        </div>
      </div>
      <div className="pr-10 pl-10">
        <p className="font-bold">Language:JavaScript</p>
        <CodeMirror
          value={javascriptDefault}
          height="400px"
          extensions={[javascript({ jsx: true })]}
          onChange={onChange}
          theme={okaidia}
          className="max-w-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-10">
        <div className="pl-10  bg-white shadow-lg">
          <CompiledOutput outputDetails={output} />
        </div>
        <div className="p-6 bg-white shadow-lg w-80 h-52 font-bold">
          Output Summary
          <OutPutDetils outputDetails={output} />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;
