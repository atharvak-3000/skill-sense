import React, { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img"; // make sure this is the browser-friendly version
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../constants";

const Upload = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    try {
      setIsProcessing(true);
      setStatusText("Uploading the file...");
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) throw new Error("Failed to upload file");

      setStatusText("Converting PDF to image...");
      const imageResult = await convertPdfToImage(file);
      if (!imageResult || !imageResult.file) {
        throw new Error("Conversion returned null/undefined or invalid file");
      }

      setStatusText("Uploading the image...");
      const uploadedImage = await fs.upload([imageResult.file]);
      if (!uploadedImage) throw new Error("Failed to upload image");

      setStatusText("Preparing data...");
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };

      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analyzing...");
      const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({
          jobTitle,
          jobDescription,
          AIResponseFormat: "json",
        })
      );
      if (!feedback) throw new Error("Failed to analyze resume");

      const feedbackText =
        typeof feedback.message.content === "string"
          ? feedback.message.content
          : feedback.message.content[0].text;

      data.feedback = JSON.parse(feedbackText);
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analysis complete, redirecting...");
      console.log(data);
      navigate(`/resume/${uuid}`);
    } catch (err) {
      console.error("Error in handleAnalyze:", err);
      setStatusText(
        `Error: ${
          err instanceof Error ? err.message : "An unknown error occurred"
        }`
      );
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setStatusText("Error: Please upload a PDF first.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    handleAnalyze({
      companyName: formData.get("company-name") as string,
      jobTitle: formData.get("job-title") as string,
      jobDescription: formData.get("job-description") as string,
      file,
    });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart Feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                className="w-full"
                alt="scan"
              />
            </>
          ) : (
            <h2>
              Drop Your Resume for an ATS score and Improvement Tips
            </h2>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  id="company-name"
                  name="company-name"
                  placeholder="Enter Company Name"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  id="job-title"
                  name="job-title"
                  placeholder="Enter Job Title"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={4}
                  id="job-description"
                  name="job-description"
                  placeholder="Enter Job Description"
                  required
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <div className="w-full">
                  <FileUploader onFileSelect={handleFileSelect} />
                </div>
                <button className="primary-button" type="submit">
                  Analyze Resume
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;
