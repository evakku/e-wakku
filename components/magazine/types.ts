export interface SanityImageReference {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

export interface Issue {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  coverImage: SanityImageReference | string; // Supporting both Sanity images and fallback image URL strings
  pdfUrl?: string;
  slug: {
    _type: 'slug';
    current: string;
  } | string;
  publishedDate: string;
}

export interface NewsletterSettings {
  _id?: string;
  heading: string;
  description: string;
  buttonText?: string;
}
