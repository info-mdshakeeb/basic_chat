import ChatBody from "../components/inbox/chatbody/ChatBody";
import Navigation from "../components/inbox/Navigation";
import Sidebar from "../components/inbox/Sidebar";

export default function Inbox() {
  return (
    <div>
      <Navigation />
      <div className="mx-auto -mt-1 max-w-7xl">
        <div className="flex min-w-full border rounded lg:grid lg:grid-cols-3">
          <Sidebar />
          <ChatBody />
        </div>
      </div>
    </div>
  );
}
