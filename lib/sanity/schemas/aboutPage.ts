import type { Rule } from 'sanity';

const aboutPage = {
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    // Hero Section
    {
      name: 'heroEyebrow',
      title: 'Hero Eyebrow',
      type: 'string',
      initialValue: 'EST. 2024',
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      validation: (rule: Rule) => rule.required(),
    },

    // Mission Section
    {
      name: 'missionTitle',
      title: 'Mission Title',
      type: 'string',
      initialValue: 'Our Mission',
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'missionDescription',
      title: 'Mission Description',
      type: 'text',
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'missionImage',
      title: 'Mission Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule: Rule) => rule.required(),
    },

    // Editorial Board Section
    {
      name: 'editorialBoard',
      title: 'Editorial Board Members',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'member',
          title: 'Board Member',
          fields: [
            {
              name: 'name',
              title: 'Full Name',
              type: 'string',
              validation: (rule: Rule) => rule.required(),
            },
            {
              name: 'role',
              title: 'Role / Position',
              type: 'string',
              validation: (rule: Rule) => rule.required(),
            },
            {
              name: 'photo',
              title: 'Photo Portrait',
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: (rule: Rule) => rule.required(),
            },
            {
              name: 'bio',
              title: 'Biography Summary',
              type: 'text',
            },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'role',
              media: 'photo',
            },
          },
        },
      ],
      validation: (rule: Rule) => rule.required().min(1),
    },
  ],
  preview: {
    select: {
      title: 'heroTitle',
    },
    prepare({ title }: { title: string }) {
      return {
        title: title || 'About Page Content',
        subtitle: 'Singleton Content Settings',
      };
    },
  },
};

export default aboutPage;
