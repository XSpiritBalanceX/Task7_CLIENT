import React from "react";

export default function Winners({ winners }) {
  return (
    <div className="history">
      {winners.map((val, index) => (
        <p className="win-btn" key={index}>{`Match ${
          index + 1
        } won by ${val}`}</p>
      ))}
    </div>
  );
}
