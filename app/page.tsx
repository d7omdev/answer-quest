"use client";
import axios from "axios";
import Markdown from "react-markdown";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { SubmitForm } from "@/components/SubmitForm";
import { Progress } from "@/components/ui/progress";
import HowTo from "@/components/how-to";
import { toast } from "sonner";

type Data = {
  text: string;
  isAcceptable: boolean;
  percentage: number;
  error?: string;
};
type Question = {
  id: string;
  askedBy: string;
  content: string;
  createdAt: string;
};

function Loader({ width }: { width?: number }) {
  return (
    <LoaderCircle
      width={width}
      height={width}
      className="mx-auto animate-spin duration-[10s] "
    />
  );
}

export default function Page() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  useEffect(() => {
    const fetchQuestion = async () => {
      setQuestionLoading(true);
      const getQuestion = await fetch("/api/question", {
        cache: "no-store",
      }).then((res) => res.json());

      if (!getQuestion) {
        setQuestion({
          id: "",
          askedBy: "",
          content: "No question found!",
          createdAt: "",
        });
        setQuestionLoading(false);
        return;
      }
      const question = getQuestion;
      console.log(question);

      setQuestion(question);
      setQuestionLoading(false);
    };
    fetchQuestion();
  }, []);

  const [data, setData] = useState<Data>({
    text: "",
    percentage: 0,
    isAcceptable: false,
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [answer, setAnswer] = useState("");
  const fetchData = async () => {
    if (answer === "") {
      toast.error("Answer is required!");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/answer", {
        question: question,
        answer: answer,
      });
      setData(response.data);
      setProgress(response.data.percentage);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-4 md:py-16 lg:py-28 z-50  ">
      <div className="text-center flex justify-center items-center flex-col">
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            height: "auto",
            overflow: "auto",
          }}
          className="relative min-h-full rounded-full px-3 mx-2 md:px-1 py-1 md:py-0.5 text-sm md:text-xs leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
        >
          Answer the question{" "}
          <span className="text-xs md:text-2xs text-gray-400">*if you can</span>{" "}
          and we&#39;ll answer your&#39;s
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-indigo-600 p-4">
          {questionLoading ? <Loader width={40} /> : question?.content}
        </h1>
        <textarea
          required
          onChange={(e) => setAnswer(e.target.value)}
          className={`mt-6  w-[90%] h-32 p-4 text-lg font-medium text-gray-900 placeholder-gray-500 bg-transparent border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-none focus-visible:ring-opacity-75  
               ${data?.error ? " ring-2 ring-red-600" : ""}
                                    `}
          placeholder={`${data?.error ? "Answer is required!" : "The answer is..."}`}
        />
        <Progress value={progress} className="w-[60%] mt-4" />
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {data.isAcceptable ? (
            <SubmitForm
              answer={answer}
              isAcceptable={data.isAcceptable}
              questionId={question!.id}
            />
          ) : (
            <Button
              onClick={() => fetchData()}
              disabled={loading}
              type="submit"
              className=" text-lg bg-indigo-600  hover:bg-indigo-500 focus-visible:outline-indigo-600 w-24 h-10"
            >
              {loading ? <Loader width={30} /> : "Submit"}
            </Button>
          )}
        </div>
        <span
          className={`p-4 mx-2 items-center justify-center mt-8 rounded-md h-auto ${data.text ? "border border-dashed border-slate-400" : ""}`}
        >
          <Markdown className=" flex gap-1 text-lg font-semibold text-gray-900 ">
            {data.error ? null : data.text.split("}")[1]}
          </Markdown>
          {data.isAcceptable ? "👍" : null}
        </span>
      </div>
      <HowTo />
    </div>
  );
}
