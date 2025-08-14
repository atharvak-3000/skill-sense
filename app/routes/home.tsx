import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { resumes } from "../constants/index";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {useLocation, useNavigate} from "react-router";
import {useEffect} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SkillSense" },
    { name: "description", content: "Smart Feedbacks for Resume!" },
  ];
}

export default function Home() {
    const {auth} = usePuterStore();

    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.isAuthenticated) navigate(`/auth?next=/`);
    }, [auth.isAuthenticated]);
    return <main className="bg-[url('/images/bg-main.svg')]">
        <Navbar></Navbar>

        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Track Your Application & Resume Ratings</h1>
                <h2>Review Your Submission and get AI powered feedback</h2>
            </div>
            {resumes.length > 0 && (
            <div className="resumes-section">
                {/*resume review here*/}
                {resumes.map((resume)=>(
                    <ResumeCard key={resume.id} resume={resume}></ResumeCard>
                ))}
            </div>)}
        </section>




    </main>;
}
