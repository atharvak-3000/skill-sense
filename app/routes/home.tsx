import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {useLocation, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SkillSense" },
    { name: "description", content: "Smart Feedbacks for Resume!" },
  ];
}

export default function Home() {
    const {auth,kv} = usePuterStore();

    const navigate = useNavigate();

    const [resumes,setResumes] = useState<Resume[]>([]);
    const[loadingResumes,setLoadingResumes] = useState(false);


    useEffect(() => {
        if (!auth.isAuthenticated) navigate(`/auth?next=/`);
    }, [auth.isAuthenticated]);

    useEffect(()=>{
        const loadResumes = async () => {
            setLoadingResumes(true);

            const resumes = (await kv.list('resume:*',true)) as KVItem[];

            const parsedResumes = resumes?.map((resume)=>(
                JSON.parse(resume.value) as Resume
            ))
            console.log(parsedResumes,)
            setResumes(parsedResumes||[])
            setLoadingResumes(false);
        }
        loadResumes();
    },[])

    return <main className="bg-[url('/images/bg-main.svg')]">
        <Navbar></Navbar>

        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Track Your Application & Resume Ratings</h1>
                {!loadingResumes && resumes.length ===0 ?(
                    <h2>No resumes found Upload yours to get feedback.</h2>
                ):(
                    <h2>Review Your submissions</h2>
                )}
            </div>
            {loadingResumes && (
                <div className="flex flex-col items-center justify-center">
                    <img src="/images/resume-scan-2.gif" className="w-[200px]"></img>
                </div>
            )}


            {!loadingResumes && resumes.length > 0 && (
            <div className="resumes-section">
                {/*resume review here*/}
                {resumes.map((resume)=>(
                    <ResumeCard key={resume.id} resume={resume}></ResumeCard>
                ))}
            </div>)}


            {!loadingResumes && resumes.length ===0 &&(
                <div className="flex flex-col items-center justify-center mt-10 gap-4">
                    <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                    Upload Your Resume</Link>
                </div>
            )}
        </section>




    </main>;
}
