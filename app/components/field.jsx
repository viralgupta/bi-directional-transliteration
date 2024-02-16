"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";

const Field = ({ setOutput, ques }) => {
  let hasRecordingStoped = true;
  let localrecorder = null;
  const [recresult, setRecresult] = useState("");
  const [primaryResult, setPrimaryResult] = useState("");
  const [secondaryResult, setSecondaryResult] = useState("");
  const [secLang, setSecLang] = useState("hi-IN");
  const [outputLang, setOutputLang] = useState(null);
  const [quesLang, setQuesLang] = useState("en-IN");
  const [question, setQuestion] = useState(ques);
  const [isChecked, setIsChecked] = useState(false)

  const startRecording = (lang) => {
    hasRecordingStoped = false;
    const recognition = new webkitSpeechRecognition();
    localrecorder = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.onerror = function (event) {
      console.log("error", event);
    };

    recognition.onend = function () {
      console.log("end");
      if (hasRecordingStoped) {
        localrecorder = null;
      }
      //  else {
      //   console.log("restarting");
      //   recognition.start();
      // }
    };

    recognition.onresult = function (event) {
      if (event.error == "no-speech") {
        recognition.start();
      }
      if (typeof event.results == "undefined") {
        recognition.onend = null;
        recognition.stop();
        return;
      }
      try {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (
            event.results[i].isFinal &&
            event.results[i][0] !== undefined &&
            event.results[i][0].transcript !== ""
          ) {
            let sestran = sessionStorage.getItem("transcript");
            setRecresult(sestran === null ? "" : sestran);
            sessionStorage.setItem(
              "transcript",
              sestran !== null
                ? sestran + " " + event.results[i][0].transcript
                : event.results[i][0].transcript
            );
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    recognition.start();
  };

  const stopRecording = (setResult, lang) => {
    hasRecordingStoped = true;
    let recordingResult = sessionStorage.getItem("transcript");
    let res = "";
    setResult((tr) => {
      res = tr + " " + recordingResult;
    });
    sessionStorage.removeItem("transcript");
    setRecresult("");
    if (localrecorder) {
      localrecorder.stop();
    }
    if (lang === "en-IN") {
      TranslateResult(
        res,
        "en-IN",
        secLang,
        setSecondaryResult,
        setPrimaryResult
      );
    } else {
      TranslateResult(
        res,
        secLang,
        "en-IN",
        setPrimaryResult,
        setSecondaryResult
      );
    }
  };

  const TranslateResult = async (
    value,
    translatefrom,
    translateto,
    setResult,
    setResult2
  ) => {
    if (setResult2) {
      setResult2(value);
    }
    setResult(await translateValue(value, translatefrom, translateto));
  };

  const translateValue = async (value, translatefrom, translateto) => {
    if (value === "" || value === null) return "";
    try {
      const res = await axios.post("http://localhost:8000/api/translate", {
        text: value,
        from: translatefrom,
        to: translateto,
        spellcheck: isChecked
      });
      return res.data.translation;
    } catch (error) {
      console.error("Error translating:", error);
      return null;
    }
  };

  const sendOutput = async () => {
    if (outputLang === null) {
      return;
    }
    let res = "";
    if (outputLang === "en-IN") {
      res = primaryResult;
    } else if (outputLang === secLang) {
      res = secondaryResult;
    } else {
      res = await translateValue(primaryResult, "en-IN", outputLang);
    }
    setOutput(res);
  };

  useEffect(() => {
    if (quesLang === "en-IN") {
      setQuestion(ques);
    } else {
      translateValue(ques, "en-IN", quesLang).then((res) => {
        setQuestion(res);
      });
    }
  }, [quesLang]);


  return (
    <Card className="w-1/2">
      <CardHeader>
        <CardTitle className="flex justify-between items-start align-top">
          {question}
          <Select onValueChange={(e) => setQuesLang(e)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Form Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-IN">English</SelectItem>
              <SelectItem value="hi-IN">Hindi</SelectItem>
              <SelectItem value="mr-IN">Marathi</SelectItem>
              <SelectItem value="ta-IN">Tamil</SelectItem>
              <SelectItem value="te-IN">Telugu</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="gap-2 flex flex-col">
        <div className="flex flex-col">
          English
          <div className="flex gap-2">
            <textarea
              onChange={(e) =>
                TranslateResult(
                  e.currentTarget.value,
                  "en-IN",
                  secLang,
                  setSecondaryResult,
                  setPrimaryResult
                )
              }
              value={primaryResult}
              className="hidescroll min-h-12 h-12 w-full border rounded-lg"
            />
            <AlertDialog>
              <AlertDialogTrigger className="w-12 h-12 p-0 bg-primary rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  viewBox="0 0 512 512"
                  enableBackground="new 0 0 512 512"
                  className="fill-white m-1"
                >
                  <g>
                    <g>
                      <path d="m439.5,236c0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,70-64,126.9-142.7,126.9-78.7,0-142.7-56.9-142.7-126.9 0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,86.2 71.5,157.4 163.1,166.7v57.5h-23.6c-11.3,0-20.4,9.1-20.4,20.4 0,11.3 9.1,20.4 20.4,20.4h88c11.3,0 20.4-9.1 20.4-20.4 0-11.3-9.1-20.4-20.4-20.4h-23.6v-57.5c91.6-9.3 163.1-80.5 163.1-166.7z" />
                      <path d="m256,323.5c51,0 92.3-41.3 92.3-92.3v-127.9c0-51-41.3-92.3-92.3-92.3s-92.3,41.3-92.3,92.3v127.9c0,51 41.3,92.3 92.3,92.3zm-52.3-220.2c0-28.8 23.5-52.3 52.3-52.3s52.3,23.5 52.3,52.3v127.9c0,28.8-23.5,52.3-52.3,52.3s-52.3-23.5-52.3-52.3v-127.9z" />
                    </g>
                  </g>
                </svg>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Speech To Text</AlertDialogTitle>
                  <AlertDialogDescription>
                    <textarea
                      value={recresult}
                      className="w-full border rounded-lg h-20"
                      disabled
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      stopRecording(setPrimaryResult, "en-IN");
                    }}
                  >
                    Stop Translating
                  </AlertDialogCancel>
                  <Button
                    onClick={() => {
                      startRecording("en-IN");
                    }}
                  >
                    Start Translating
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="">
            <select onChange={(e) => setSecLang(e.target.value)}>
              <option value="ta-IN">Tamil</option>
              <option value="te-IN">Telugu</option>
              <option selected value="hi-IN">
                Hindi
              </option>
              <option value="mr-IN">Marathi</option>
            </select>
          </div>
          <div className="flex gap-2">
            <textarea
              value={secondaryResult}
              onChange={(e) =>
                TranslateResult(
                  e.currentTarget.value,
                  secLang,
                  "en-IN",
                  setPrimaryResult,
                  setSecondaryResult
                )
              }
              className="hidescroll min-h-12 h-12 w-full border rounded-lg"
            />
            <AlertDialog>
              <AlertDialogTrigger className="w-12 h-12 p-0 bg-primary rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  viewBox="0 0 512 512"
                  enableBackground="new 0 0 512 512"
                  className="fill-white m-1"
                >
                  <g>
                    <g>
                      <path d="m439.5,236c0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,70-64,126.9-142.7,126.9-78.7,0-142.7-56.9-142.7-126.9 0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,86.2 71.5,157.4 163.1,166.7v57.5h-23.6c-11.3,0-20.4,9.1-20.4,20.4 0,11.3 9.1,20.4 20.4,20.4h88c11.3,0 20.4-9.1 20.4-20.4 0-11.3-9.1-20.4-20.4-20.4h-23.6v-57.5c91.6-9.3 163.1-80.5 163.1-166.7z" />
                      <path d="m256,323.5c51,0 92.3-41.3 92.3-92.3v-127.9c0-51-41.3-92.3-92.3-92.3s-92.3,41.3-92.3,92.3v127.9c0,51 41.3,92.3 92.3,92.3zm-52.3-220.2c0-28.8 23.5-52.3 52.3-52.3s52.3,23.5 52.3,52.3v127.9c0,28.8-23.5,52.3-52.3,52.3s-52.3-23.5-52.3-52.3v-127.9z" />
                    </g>
                  </g>
                </svg>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Speech To Text</AlertDialogTitle>
                  <AlertDialogDescription>
                    <textarea
                      value={recresult}
                      className="w-full border rounded-lg h-20"
                      disabled
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      stopRecording(setSecondaryResult, secLang);
                    }}
                  >
                    Stop Translating
                  </AlertDialogCancel>
                  <Button
                    onClick={() => {
                      startRecording(secLang);
                    }}
                  >
                    Start Translating
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex gap-1 ml-1">
            <input
              type="checkbox"
              id="spell"
              checked={isChecked}
              onChange={()=>setIsChecked(x => !x)}
            />
            <label htmlFor="spell">Spell Check</label>
          </div>
        </div>
        <CardFooter className="p-0 mt-2 flex justify-between">
          <Select onValueChange={(e) => setOutputLang(e)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Output Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-IN">English</SelectItem>
              <SelectItem value="hi-IN">Hindi</SelectItem>
              <SelectItem value="mr-IN">Marathi</SelectItem>
              <SelectItem value="ta-IN">Tamil</SelectItem>
              <SelectItem value="te-IN">Telugu</SelectItem>
            </SelectContent>
          </Select>
          <Button
            disabled={outputLang === null ? true : false}
            onClick={sendOutput}
          >
            Send Output
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default Field;
