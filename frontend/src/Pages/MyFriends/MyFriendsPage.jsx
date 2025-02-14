import React, { useEffect, useState } from "react";
import FriendCard from "../../Components/MyFriends/FriendCard";
import SearchBar from "../../Components/Layout/SearchBar";
import FriendsSideBar from "../../Components/MyFriends/FriendsSideBar";
import axios from "axios";
import Loading from "../../Components/Layout/Loading";
import summaryApi from "../../../common/index";


export default function MyFriendsPage() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          summaryApi.myFriends.url,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFriends(response.data);
      } catch (error) {
        setError("Failed to fetch friends");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleRemoveFriend = (friendId) => {
    setFriends((prevFriends) =>
      prevFriends.filter((friend) => friend._id !== friendId)
    );
    setSelectedFriendId(null);
  };

  const toggleDeleteOption = (friendId) => {
    setSelectedFriendId((prevId) => (prevId === friendId ? null : friendId));
  };

  if (loading) {
    return <Loading color={"#666AEC"} />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="grid grid-cols-10 gap-10">
      <div className="col-span-10 lg:col-span-6 xl:col-span-7 p-5 md:p-10">
        <SearchBar />
        <h1 className="text-4xl font-semibold text-center dark:text-bg my-10">
          My Friends
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {friends.map((friend) => (
            <FriendCard
              friend={friend}
              key={friend._id}
              onRemoveFriend={handleRemoveFriend}
              isDeleteOptionVisible={selectedFriendId === friend._id}
              onToggleDeleteOption={() => toggleDeleteOption(friend._id)}
            />
          ))}
        </div>
      </div>
      <FriendsSideBar />
    </div>
  );
}
