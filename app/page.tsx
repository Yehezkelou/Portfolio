import { Hero } from "@/components/Hero";
import { Profile } from "@/components/Profile";
import { Projects } from "@/components/Projects";
import { Certifications } from "@/components/Certifications";
import { Contact } from "@/components/Contact";
export default function Page() { return <main id="main"><Hero /><Projects headingTag="h2" /><Profile /><Certifications headingTag="h2" /><Contact headingTag="h2" /></main>; }
