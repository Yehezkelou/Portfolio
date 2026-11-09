"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/content";
import { TechRow } from "./TechIcons";

type Props = {
  project: Project;
  isPlaying: boolean;
  reduced: boolean;
  register: (slug: string, el: HTMLVideoElement | null) => void;
  onHover: (slug: string | null) => void;
  onManual: (slug: string) => void;
  onPlaybackChange: (slug: string, active: boolean) => void;
};

export function ProjectCard({ project, isPlaying, reduced, register, onHover, onManual, onPlaybackChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    register(project.slug, videoRef.current);
    return () => register(project.slug, null);
  }, [register, project.slug]);

  return (
    <article
      onMouseEnter={() => onHover(project.slug)}
      onMouseLeave={() => onHover(null)}
      className={`project ${project.featured ? "project--featured" : "project--minor"}`}
    >
      <figure className="project__figure" data-playing={isPlaying ? "true" : "false"}>
        {project.video.mp4 && (
          <video
            ref={videoRef}
            className="project__video"
            data-slug={project.slug}
            muted loop playsInline
            preload="metadata"
            poster={project.video.poster}
            tabIndex={-1}
            aria-hidden="true"
            onPlaying={() => onPlaybackChange(project.slug, true)}
            onPause={() => onPlaybackChange(project.slug, false)}
            onError={() => onPlaybackChange(project.slug, false)}
          >
            {project.video.webm && <source src={project.video.webm} type="video/webm" />}
            <source src={project.video.mp4} type="video/mp4" />
          </video>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="project__poster" src={project.video.poster} alt="" aria-hidden="true" />
        {project.video.mp4 && (
          <button
            type="button"
            className="project__play"
            data-always={reduced ? "true" : "false"}
            aria-label={`${isPlaying ? "Mettre en pause" : "Lire"} la présentation : ${project.title}`}
            aria-pressed={isPlaying}
            onClick={() => onManual(project.slug)}
          >
            <span>
              <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true">
                {isPlaying
                  ? <path d="M3 2h5v18H3zM12 2h5v18h-5z" fill="currentColor" />
                  : <path d="M2 2 L18 11 L2 20 Z" fill="currentColor" />}
              </svg>
            </span>
          </button>
        )}
      </figure>
      <div className="project__body">
        <p className="project__category">{project.category}</p>
        <h3 className="project__title">{project.title}</h3>
        <p className="project__problem">{project.problem}</p>
        <TechRow keys={project.tech} />
        <p className="media-caption">{project.video.kind === "recording" ? "Démonstration de l’application" : "Présentation animée · illustration du projet"}</p>
        <details className="project__details">
          <summary>Ce que fait le projet <span aria-hidden="true">+</span></summary>
          <ul>{project.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
        </details>
        <div className="project__links">
          {project.repo && <a href={project.repo} target="_blank" rel="noopener noreferrer">Dépôt</a>}
          {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer">Démo en ligne</a>}
        </div>
      </div>
    </article>
  );
}
