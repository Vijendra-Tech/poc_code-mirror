import React from "react";
import { Buffer } from "buffer";

export default function CompiledOutput({ outputDetails }) {
  const getOutput = () => {
    let statusId = outputDetails?.status?.id;

    if (statusId === 6) {
      // Error Message
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {Buffer.from(outputDetails?.compile_output, "base64")}
        </pre>
      );
    } else if (statusId === 3) {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-green-500">
          {Buffer.from(outputDetails.stdout, "base64") !== null
            ? `${Buffer.from(outputDetails.stdout, "base64")}`
            : null}
        </pre>
      );
    } else if (statusId === 5) {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {`Time Limit Exceeded`}
        </pre>
      );
    } else {
      return (
        <pre className="px-2 py-1 font-normal text-xs text-red-500">
          {Buffer.from(outputDetails?.stderr, "base64")}
        </pre>
      );
    }
  };
  return (
    <>
      <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
        Output
      </h1>
      <div className="w-full h-52 bg-[#1e293b] rounded-md text-white font-normal text-sm overflow-y-auto scroll-pb-2">
        {outputDetails ? <>{getOutput()}</> : null}
      </div>
    </>
  );
}
