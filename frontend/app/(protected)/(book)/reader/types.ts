export interface BookDetails {
  title: string;
  filename: string;
}

export interface BookSelection {
  text: string;
  location: string;
}

export interface Visualization extends BookSelection {
  id: string;
  img_url?: string;
  img_prompt?: string;
  chapter?: string | null;
}

