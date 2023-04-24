import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import axios from "axios";
import { Buffer } from "buffer";
import OutPutDetils from "./components/Output";
import CompiledOutput from "./components/CompiledOutput";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import Footer from "./components/Footer";
import { toastMessage } from "./components/Toast";
import { ToastContainer } from "react-toastify";

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
  const [processing, setProcessing] = useState(false);

  const onChange = (value, viewUpdate) => {
    setCode(value);
  };

  const hanndleExecute = () => {
    setProcessing(true);
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
        setProcessing(true);
        const token = res?.data?.token;
        checkStatusFromAPI(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response?.status;
        console.log("status", status);
        if(status === undefined){
          toastMessage("Please set API Key in Env File",false)
        }
        if (status === 429) {
          console.log("too many requests", status);
          toastMessage(
            "Quota of 50 requests exceeded for the Day!Plese try again tomorrow or choose some other plan ",
            false
          );
        }
        setProcessing(false);
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
      if (statusId === 11) {
        setProcessing(false);
        toastMessage(response?.data?.status?.description, false);
        return;
      }
      setOutPut(response.data);
      setProcessing(false);
      toastMessage("Compiled Successfully!", true);
    } catch (error) {
      setProcessing(false);
      showErrorToast("something went wrong!", false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="left-20 right-30 top-5 ml-10 mt-10 grid grid-cols-2 gap-2">
        <h4 className="text-3xl font-semibold">JavaScript Code Editor</h4>
        <div className="grid-cols-4">
          <button
            className="bg-black hover:bg-black text-white font-bold py-2 px-4 rounded"
            onClick={() => hanndleExecute()}
          >
            {!processing ? "Compile and Execute" : "In Processing..."}
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
