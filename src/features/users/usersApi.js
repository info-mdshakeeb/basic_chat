import { apiSlice } from "../api/apiSlice";

const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (email) => `/users?email=${email}`,
    }),
  }),

})
export const { useGetUsersQuery } = userApi;