import React from 'react'
import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath }
}: { resume: Resume }) => {
  return (
    <Link
      to={`/resume/${id}`}
      className="resume-card animate-in fade-in duration-1000 overflow-hidden rounded-lg border border-gray-200 shadow-sm"
    >
      {/* Card Header */}
      <div className="resume-card-header flex items-center justify-between p-4">
        <div className="flex flex-col gap-2">
          <h2 className="!text-black font-bold break-words">
            {companyName}
          </h2>
          <h3 className="text-lg break-words text-gray-500">
            {jobTitle}
          </h3>
        </div>

        <div className="flex-shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>

      {/* Image Section */}
      <div className="gradient-border animate-in fade-in duration-1000 overflow-hidden rounded-b-lg">
        <img
          src={imagePath} // e.g. "resume_01.png"
          alt="resume"
          className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
        />
      </div>
    </Link>
  )
}

export default ResumeCard;
