import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export interface TemplateResponse {
  success: boolean;
  data: {
    template: any;
    userInfo: any;
    metadata: any;
  };
}

export interface TemplatesListResponse {
  success: boolean;
  data: {
    userTemplates: any[];
    defaultTemplates: any[];
  };
}

export interface SaveTemplateRequest {
  templateSlug: string;
  customSettings: any;
  isPublished?: boolean;
}

export const templateApi = createApi({
  reducerPath: 'templateApi',
  baseQuery,
  tagTypes: ['Template'],
  endpoints: (builder) => ({
    getUserTemplate: builder.query<TemplateResponse, { slug: string; userId?: string | null }>({
      query: ({ slug, userId }) => {
        const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        return { url: `/api/templates/user/${encodeURIComponent(slug)}${qs}` };
      },
      providesTags: (result, error, arg) => [{ type: 'Template', id: arg.slug }],
    }),

    getUserTemplates: builder.query<TemplatesListResponse, void>({
      query: () => ({ url: '/api/templates/user' }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.userTemplates.map((t: any) => ({ type: 'Template' as const, id: t.slug })),
              ...result.data.defaultTemplates.map((t: any) => ({ type: 'Template' as const, id: t.slug })),
              { type: 'Template' as const, id: 'LIST' },
            ]
          : [{ type: 'Template' as const, id: 'LIST' }],
    }),

    saveUserTemplate: builder.mutation<{ success: boolean; data: any }, SaveTemplateRequest>({
      query: (body) => ({
        url: '/api/templates/user',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Template', id: arg.templateSlug },
        { type: 'Template', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetUserTemplateQuery,
  useGetUserTemplatesQuery,
  useSaveUserTemplateMutation,
} = templateApi;
