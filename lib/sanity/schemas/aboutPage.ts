export default {
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
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },

    // Mission Section
    {
      name: 'missionTitle',
      title: 'Mission Title',
      type: 'string',
      initialValue: 'Our Mission',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'missionDescription',
      title: 'Mission Description',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'missionImage',
      title: 'Mission Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
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
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'role',
              title: 'Role / Position',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'photo',
              title: 'Photo Portrait',
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: (Rule: any) => Rule.required(),
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
      validation: (Rule: any) => Rule.required().min(1),
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
