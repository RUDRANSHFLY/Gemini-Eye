/* eslint-disable @typescript-eslint/no-unused-vars */
import "./App.css";
import { ChangeEvent, useState } from "react";

const App = () => {
  const [image, setImage] = useState<File | null>(null);
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const supriseOptions = [
    "Does the image have a whale ?",
    "Is the image fabulously pink ?",
    "Does the image have puppies ?",
  ];

  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e && e.target.files) {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      setImage(e.target.files[0]);
      e.target.value = "";
      try {
        const options = {
          method: "POST",
          body: formData,
        };
        const response = await fetch(
          "https://gemini-eye.onrender.com/upload",
          options
        );
        const data = response.json();
        console.table(data);
      } catch (err) {
        console.error(err);
        setError("Something didn't work! Please try again.");
      }
    }
  };

  const analyzeImage = async () => {
    setResponse("");
    if (!image) {
      setError("Error! must have an existing image!");
      return;
    }
    try {
      const options = {
        method: "POST",
        body: JSON.stringify({
          message: value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };

      const responsePrompt = await fetch(
        "https://gemini-eye.onrender.com/gemini-eye",
        options
      );
      const answerPrompt = await responsePrompt.text();
      setResponse(answerPrompt);
    } catch (err) {
      console.log(err);
      setError("Something didn't work! Please try again.");
    }
  };

  const suprise = () => {
    const randomValue =
      supriseOptions[Math.floor(Math.random() * supriseOptions.length)];
    setValue(randomValue);
  };

  const clear = () => {
    setImage(null);
    setValue("");
    setResponse("");
    setError("");
  };

  return (
    <div className={"App"}>
      <section className={"searchSection"}>
        <div className={"imageContainer"}>
          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt={"userUploadImage"}
              title={"inputImage"}
            />
          )}
        </div>
        <p className={"extraInfo"}>
          <span id={"headUpload"}>
            <label htmlFor="file">Upload an Image</label>
            <input
              id={"file"}
              type={"file"}
              accept={"image/*"}
              hidden
              onChange={uploadImage}
            />
          </span>
          to ask question about.
        </p>
        {!response && (
          <p className="extra">
            What do u want to know about the image ?
            <button
              type={"submit"}
              className={"suprise"}
              onClick={suprise}
              disabled={response.length > 0 ? true : false}
            >
              Suprise me
            </button>
          </p>
        )}
        <div className={"inputContainer"}>
          <input
            value={value}
            placeholder={"What is in the image..."}
            onChange={(e) => setValue(e.target.value)}
          />
          {!response && !error && (
            <button type={"button"} onClick={analyzeImage}>
              Ask me
            </button>
          )}
          {!response ||
            (!error && (
              <button type={"button"} onClick={clear}>
                Clear
              </button>
            ))}
        </div>
        {error && <p>{error}</p>}
        {response && <p className={"answer"}>{response}</p>}
      </section>
    </div>
  );
};

export default App;
