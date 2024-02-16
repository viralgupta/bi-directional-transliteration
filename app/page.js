"use client";
import Field from "@/app/components/field";
import Output from "./components/output";
import { useState } from "react";

export default function Home() {
  const [output, setOutput] = useState("")
  return (
    <div style={{backgroundImage: `url("https://img.freepik.com/free-vector/background-line-abstract-luxury-gradient_483537-3304.jpg?w=1060&t=st=1707891978~exp=1707892578~hmac=bb3a309168ec528e23319a15c82cb5b5890c500bbef3a3b949ddc59c288feaa8")`}} className="w-full h-full flex items-center justify-center gap-5 py-32">
      <Field setOutput={setOutput} ques={"Tell About Yourself"}/>      
      <Output value={output}/>
    </div>
  );
}
