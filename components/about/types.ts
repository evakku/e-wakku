import type { SanityImageReference } from "@/components/magazine/types";

export interface EditorialMember {
  name: string;
  role: string;
  photo: SanityImageReference | string;
  bio?: string;
}

export interface AboutPageData {
  heroTitle: string;
  heroDescription: string;
  heroEyebrow?: string;
  missionTitle: string;
  missionDescription: string;
  missionImage: SanityImageReference | string;
  editorialBoard: EditorialMember[];
}
