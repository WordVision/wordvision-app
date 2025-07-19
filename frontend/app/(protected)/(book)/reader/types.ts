export interface BookDetails {
  title: string;
  filename: string;
}

export interface BookSelection {
  text: string;
  location: string;
}

export interface Visualization extends BookSelection {
  id: number;
  img_url: string | null;
  img_prompt: string | null;
  chapter: string | null;
}

