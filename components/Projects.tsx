"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { projects } from "@/lib/content";
import { ProjectCard } from "./ProjectCard";

export function Projects({ headingTag: Heading = "h1" }: { headingTag?: "h1" | "h2" } = {}) {
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const request = useRef<string | null>(null);
  const manual = useRef<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [reduced, setReduced] = useState(true);

  const register = useCallback((slug: string, el: HTMLVideoElement | null) => {
    if (el) videos.current.set(slug, el);
    else videos.current.delete(slug);
  }, []);

  const apply = useCallback((slug: string | null) => {
    request.current = slug;
    videos.current.forEach((video, key) => {
      if (key !== slug) video.pause();
    });
    if (!slug) { setPlaying(null); return; }
    const video = videos.current.get(slug);
    if (!video) return;
    video.play().then(() => {
      if (request.current === slug) setPlaying(slug);
    }).catch(() => {
      if (request.current === slug) { request.current = null; setPlaying(null); }
    });
  }, []);

  const onHover = useCallback((slug: string | null) => {
    if (reduced || manual.current || !window.matchMedia("(hover: hover)").matches) return;
    apply(slug);
  }, [apply, reduced]);

  const onManual = useCallback((slug: string) => {
    if (request.current === slug) {
      // Keep a deliberate pause until another presentation is chosen.
      manual.current = slug;
      apply(null);
    } else {
      manual.current = slug;
      apply(slug);
    }
  }, [apply]);

  const onPlaybackChange = useCallback((slug: string, active: boolean) => {
    if (active && request.current === slug) setPlaying(slug);
    else if (!active) setPlaying((current) => current === slug ? null : current);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(mq.matches); if (mq.matches) apply(null); };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [apply]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const slug = (entry.target as HTMLVideoElement).dataset.slug;
        if (!entry.isIntersecting && slug === request.current) {
          manual.current = null;
          apply(null);
        }
      }
    });
    const elements = [...videos.current.values()];
    elements.forEach((video) => observer.observe(video));
    return () => { observer.disconnect(); elements.forEach((video) => video.pause()); };
  }, [apply]);

  return (
    <section id="projets" className="shell editorial" aria-labelledby="projets-title">
      <p className="margin-label">projets</p>
      <div>
        <Heading id="projets-title" className="h2">Des idées aux applications.</Heading>
        <p className="projects-intro">Quatre projets, des besoins concrets. Explorez les présentations et les technologies derrière chaque application.</p>
        <div className="projects-grid">
          {projects.map((project) => <ProjectCard key={project.slug} project={project} isPlaying={playing === project.slug} reduced={reduced} register={register} onHover={onHover} onManual={onManual} onPlaybackChange={onPlaybackChange} />)}
        </div>
      </div>
    </section>
  );
}
