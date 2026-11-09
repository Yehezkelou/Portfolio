import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiNestjs,
  SiPython,
  SiFastapi,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiDocker,
  SiKubernetes,
  SiAmazon,
  SiTerraform,
  SiGithubactions,
  SiRabbitmq,
  SiTailwindcss,
  SiGo,
  SiGrafana,
} from "react-icons/si";
import type { TechKey } from "@/lib/content";

const COLORS: Partial<Record<TechKey, string>> = {
  javascript: "#8a6b00", typescript: "#2468ad", react: "#087c9c",
  nextdotjs: "#252525", nodedotjs: "#397835", nestjs: "#bc1747",
  python: "#326b98", postgresql: "#336791",
};

const TECH: Record<TechKey, { icon: IconType; label: string }> = {
  javascript: { icon: SiJavascript, label: "JavaScript" },
  typescript: { icon: SiTypescript, label: "TypeScript" },
  react: { icon: SiReact, label: "React" },
  nextdotjs: { icon: SiNextdotjs, label: "Next.js" },
  nodedotjs: { icon: SiNodedotjs, label: "Node.js" },
  nestjs: { icon: SiNestjs, label: "NestJS" },
  python: { icon: SiPython, label: "Python" },
  fastapi: { icon: SiFastapi, label: "FastAPI" },
  postgresql: { icon: SiPostgresql, label: "PostgreSQL" },
  mongodb: { icon: SiMongodb, label: "MongoDB" },
  redis: { icon: SiRedis, label: "Redis" },
  docker: { icon: SiDocker, label: "Docker" },
  kubernetes: { icon: SiKubernetes, label: "Kubernetes" },
  amazonaws: { icon: SiAmazon, label: "Amazon Web Services" },
  terraform: { icon: SiTerraform, label: "Terraform" },
  githubactions: { icon: SiGithubactions, label: "GitHub Actions" },
  rabbitmq: { icon: SiRabbitmq, label: "RabbitMQ" },
  tailwindcss: { icon: SiTailwindcss, label: "Tailwind CSS" },
  go: { icon: SiGo, label: "Go" },
  grafana: { icon: SiGrafana, label: "Grafana" },
};

export function TechRow({ keys }: { keys: TechKey[] }) {
  return (
    <ul className="tech-row" aria-label="Technologies utilisées">
      {keys.map((key) => {
        const entry = TECH[key];
        if (!entry) return null;
        const Icon = entry.icon;
        return (
          <li key={key} className="tech-badge" style={{ "--tech-color": COLORS[key] ?? "#45453f" } as CSSProperties}>
            <Icon
              className="tech-icon"
              aria-hidden="true"
              size={18}
            />
            <span>{entry.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
