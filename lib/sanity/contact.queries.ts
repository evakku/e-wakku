// Fetches Contact page content settings
export const contactPageQuery = `
  *[_type == "contactPage"][0] {
    _id,
    contactTitle,
    contactDescription,
    contactEmail,
    socialLinks[] {
      label,
      url
    }
  }
`;
