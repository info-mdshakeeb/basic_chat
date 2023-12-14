import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Conversation />} />
        <Route path="/:id" element={<Inbox />} />
      </Routes>
    </Router>
  );
}

export default App;
