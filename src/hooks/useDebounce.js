import { useState } from "react";

const useDebounce = (initialState, delay) => {
  const [state, setState] = useState(initialState);

  const debounceHandler = (fn, delay) => {
    let timer;
    return (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => { fn(e) }, delay);
    }
  }

  const handleSearch = debounceHandler((e) => setState(e.target.value), delay);
  return [state, handleSearch];

}
export default useDebounce;