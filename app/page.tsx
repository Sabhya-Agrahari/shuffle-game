"use client";

import { useState } from "react";
import GameSelector from "./(Component)/GameSelector";
import ShufflePick from "./(Component)/ShufflePick";
import Spinner from "./(Component)/Spinner";
import ScratchCard from "./(Component)/ScratchCard";

type Step = "form" | "select" | "game" | "result";
type GameType = "shuffle" | "spinner" | "mcq";

export default function PickAndWinPage() {
  const [step, setStep] = useState<Step>("form");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [game, setGame] = useState<GameType | null>(null);
  const [reward, setReward] = useState("");
  const [scratchReward, setScratchReward] = useState("");

  // handle input change
  const handleChange = (value: string, index: number) => {
    const updated = [...choices];
    updated[index] = value;
    setChoices(updated);
  };

  // add new field
  const addField = () => {
    setChoices((prev) => [...prev, ""]);
  };

  // filter valid choices
  const validChoices = choices.filter((c) => c.trim() !== "");

  // 🎟️ FIX: generate scratch reward BEFORE game starts
  const startScratchGame = () => {
    const random =
      validChoices[Math.floor(Math.random() * validChoices.length)];

    setScratchReward(random);
    setGame("mcq");
    setStep("game");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">

      {/* STEP 1: FORM */}
      {step === "form" && (
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">🎁 Enter Your Choices</h1>

          {choices.map((value, index) => (
            <input
              key={index}
              value={value}
              onChange={(e) => handleChange(e.target.value, index)}
              placeholder={`Choice ${index + 1}`}
              className="border p-2 rounded block w-64 mx-auto"
            />
          ))}

          <button
            onClick={addField}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            + Add More
          </button>

          <div className="flex flex-wrap gap-2 justify-center">
            {validChoices.map((c, i) => (
              <span key={i} className="bg-black px-3 py-1 rounded">
                {c}
              </span>
            ))}
          </div>

          <button
            disabled={validChoices.length < 4}
            onClick={() => setStep("select")}
            className="bg-green-500 text-white px-6 py-2 rounded"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 2: SELECT GAME */}
      {step === "select" && (
        <GameSelector
          onSelect={(g: GameType) => {
            setGame(g);

            // 🎟️ FIX: scratch game special handling
            if (g === "mcq") {
              startScratchGame();
            } else {
              setStep("game");
            }
          }}
        />
      )}

      {/* STEP 3: GAME */}
      {step === "game" && game === "shuffle" && (
        <ShufflePick
          choices={validChoices}
          onWin={(res: string) => {
            setReward(res);
            setStep("result");
          }}
        />
      )}

      {step === "game" && game === "spinner" && (
        <Spinner
          choices={validChoices}
          onWin={(res: string) => {
            setReward(res);
            setStep("result");
          }}
        />
      )}

      {game === "mcq" && step === "game" && scratchReward && (
        <ScratchCard
          reward={scratchReward}
          onWin={(res: string) => {
            setReward(res);
            setStep("result");
          }}
        />
      )}

      {/* STEP 4: RESULT */}
      {step === "result" && (
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">🎉 Result</h2>
          <p className="text-xl">{reward}</p>

          <button
            onClick={() => {
              setStep("select");
              setReward("");
              setScratchReward("");
              setGame(null);
            }}
            className="bg-purple-500 text-white px-6 py-2 rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}