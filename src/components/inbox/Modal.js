import { useEffect, useState } from "react";
import { useGetUsersQuery } from "../../features/users/usersApi";
import Error from "../ui/Error";
import { useDispatch, useSelector } from "react-redux";
import { conversationsApi, useCreateConversationMutation, useEditConversationMutation } from "../../features/conversations/conversationsApi";

export default function Modal({ open, control }) {
  const dispatch = useDispatch()
  const [message, setMessage] = useState("");
  const [to, setTo] = useState('');
  const [resError, setResError] = useState("")
  const [conversations, setConversation] = useState(undefined)
  const { user: myInfo } = useSelector(state => state.auth)



  const debounceHandler = (callback, delay) => {
    let timer;
    return (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => { callback(e) }, delay);
    };
  };
  const handleSearch = debounceHandler((e) => setTo(e.target.value), 1000);

  // data load
  const { data: participant, } = useGetUsersQuery(to, { skip: !to })
  const [createConversation, { isSuccess: isAddSuccess }] = useCreateConversationMutation()
  const [editConversation, { isSuccess: isEditSuccess }] = useEditConversationMutation()


  useEffect(() => {
    if (participant?.length > 0 && !(participant[0].email === myInfo?.email)) {
      dispatch(conversationsApi.endpoints.getConversation.initiate({
        userEmail: myInfo?.email,
        participantEmail: participant[0].email
      })).unwrap().then(data => setConversation(data)
      ).catch((error) => setResError(error)
      )
    }
  }, [participant, myInfo, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault()
    const message = e.target.message.value
    if (conversations.length > 0) {
      // edit Conversation
      editConversation({
        id: conversations[0].id,
        sender: myInfo.email,
        data: {
          participants: `${myInfo.email}-${participant[0].email}`,
          users: [myInfo, participant[0]],
          message,
          timestamp: new Date().getTime(),
        }
      })
    } else {
      // add conversation
      createConversation({
        sender: myInfo.email,
        data: {
          participants: `${myInfo.email}-${participant[0].email}`,
          users: [myInfo, participant[0]],
          message,
          timestamp: new Date().getTime(),
        }
      })
    }

  }
  useEffect(() => {
    if (isAddSuccess || isEditSuccess) {
      control()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddSuccess, isEditSuccess])


  return (
    open && (
      <>
        <div
          onClick={control}
          className="fixed inset-0 z-10 w-full h-full cursor-pointer bg-black/50"
        ></div>
        <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Send message
          </h2>
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6" >
            <input type="hidden" name="remember" value="true" />
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="to" className="sr-only">
                  To
                </label>
                <input
                  onChange={handleSearch}
                  id="to" name="to" type="text" required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Send to"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  onChange={(e) => setMessage(e.target.value)}
                  id="message"
                  name="message"
                  type="message"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Message"
                />
              </div>
            </div>

            <div>
              <button
                disabled={conversations === undefined || (participant?.length > 0 && participant[0].email === myInfo?.email)}
                type="submit"
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md disabled:bg-slate-400 group bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Send Message
              </button>
            </div>
            {participant?.length > 0 && participant[0].email === myInfo?.email &&
              <Error message={"you cannot sand message to yourself"} />}
            {participant?.length === 0 && <Error message="no user found" />}
            {resError && <Error message={resError?.message} />}
          </form>
        </div>
      </>
    )
  );
}
