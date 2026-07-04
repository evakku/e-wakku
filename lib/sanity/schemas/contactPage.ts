import type { Rule } from 'sanity';

const contactPage = {
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  fields: [
    {
      name: 'contactTitle',
      title: 'Contact Title',
      type: 'string',
      initialValue: 'Get in Touch',
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'contactDescription',
      title: 'Contact Description',
      type: 'text',
      initialValue: "Whether you have a story pitch, a question about our archives, or simply want to say hello, we're always open to conversation.",
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'contactEmail',
      title: 'Contact Email Address',
      type: 'string',
      initialValue: 'hello@thejournal.com',
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          title: 'Social Link',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule: Rule) => rule.required(),
            },
            {
              name: 'url',
              title: 'URL',
              type: 'string',
              validation: (rule: Rule) => rule.required(),
            },
          ],
        },
      ],
      validation: (rule: Rule) => rule.required().min(1),
    },
  ],
  preview: {
    select: {
      title: 'contactTitle',
    },
    prepare({ title }: { title: string }) {
      return {
        title: title || 'Contact Page Content',
        subtitle: 'Singleton Content Settings',
      };
    },
  },
};

export default contactPage;
