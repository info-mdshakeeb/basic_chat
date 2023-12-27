import { apiSlice } from "../api/apiSlice";
import { messagesApi } from "../messages/messagesApi";
import io from "socket.io-client";

export const conversationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: (email) =>
        `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=100`,
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        // create socket connection

        const socket = io(process.env.REACT_APP_API_URL, {
          reconnectionDelay: 1000,
          reconnection: true,
          reconnectionAttempts: 10,
          transports: ["websocket"],
          agent: false,
          upgrade: false,
          rejectUnauthorized: false,
        });
        try {
          await cacheDataLoaded
          socket.on("conversation", (data) => {
            console.log(data);

            updateCachedData(draft => {
              console.log(draft);

              const conversation = draft.find(c => c.id === data.data.id)
              if (conversation?.id) {
                conversation.message = data.data.message
                conversation.timestamp = data.data.timestamp
              } else {
                draft.unshift(data.data)
              }
            })
          })
        } catch (error) { console.log(error) }
      },

    }),
    getConversation: builder.query({
      query: ({ userEmail, participantEmail }) => `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail} `,
    }),
    createConversation: builder.mutation({
      query: ({ sender, data }) => ({
        url: "/conversations",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        let patchResult2
        try {
          const data = await queryFulfilled
          patchResult2 = dispatch(
            apiSlice.util.updateQueryData("getConversations", arg.sender, (draft) => {
              const draftConversation = draft.find(c => c.id == data?.data.id)
              if (draftConversation) {
                draftConversation.message = arg.data.message
                draftConversation.timestamp = arg.data.timestamp
              }
              else { draft.unshift(data?.data) }
            }))
          if (data?.data.id) {
            const users = arg.data.users
            const sender = users.find(user => user.email === arg.sender)
            const receiver = users.find(user => user.email !== arg.sender)
            dispatch(messagesApi.endpoints.createMessage.initiate({
              conversationId: data?.data.id,
              sender,
              receiver,
              message: arg.data.message,
              timestamp: arg.data.timestamp
            }))
          }
        } catch (error) {
          patchResult2.undo()
          console.log(error.message);
        }
      }
    }),
    editConversation: builder.mutation({
      query: ({ id, sender, data }) => ({
        url: `/conversations/${id}`,
        method: "PATCH",
        body: data
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        // optimistic cash update start :

        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getConversations", arg.sender, (draft) => {
            const draftConversation = draft.find(c => c.id == arg.id)
            draftConversation.message = arg.data.message
            draftConversation.timestamp = arg.data.timestamp
          }))
        // optimistic cash update end
        try {
          const data = await queryFulfilled
          if (data.data?.id) {
            const users = arg.data.users
            const sender = users.find(user => user.email === arg.sender)
            const receiver = users.find(user => user.email !== arg.sender)
            await dispatch(messagesApi.endpoints.createMessage.initiate({
              conversationId: data?.data.id,
              sender,
              receiver,
              message: arg.data.message,
              timestamp: arg.data.timestamp
            })).unwrap()

            // pessimistic cash update start :
            // dispatch(
            //   apiSlice.util.updateQueryData("getMessages", res.conversationId.toString(),
            //     (draft) => { draft.push(res) }
            //   ))
            // pessimistic cash update end
          }
        } catch (error) {
          patchResult.undo()
          console.log(error.message);
        }
      }
    })
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useEditConversationMutation,
  useCreateConversationMutation,
  useLazyGetConversationQuery } = conversationsApi;
