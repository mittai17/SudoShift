import React, { useState } from 'react';
import Spreadsheet from "react-spreadsheet";
import { createRoot } from 'react-dom/client';

const App = () => {
  const [data, setData] = useState([
    [{ value: "Vanilla" }, { value: "Chocolate" }],
    [{ value: "Strawberry" }, { value: "Cookies" }],
  ]);
  return <Spreadsheet data={data} onChange={setData} />;
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
