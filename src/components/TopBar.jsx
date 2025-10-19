import React from "react";
import starIcon from "../assets/svg/star.svg"; // путь к SVG
import "./TopBar.css";

export const TopBar = ({ user }) => {
  return (
    <div className="topbar">
      <div className="user-info">
        <img
          src={user.photo_url}
          alt={user.username}
          className="avatar"
        />
        <span className="username">@{user.username}</span>
      </div>

      <div className="balance-container">
        <img src={starIcon} alt="balance" className="balance-icon" />
        <span className="balance-amount">{user?.balance ?? 0}</span>
      </div>
    </div>
  );
};
