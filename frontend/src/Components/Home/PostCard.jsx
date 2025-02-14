import React, { useContext, useState, useEffect } from "react";
import {
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShareAlt,
} from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../../Contexts/UserContext";
import summaryApi from "../../../common";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content"; // for React components inside Swal
import PostOptions from "./PostOptions"; // Import the refactored dropdown component
import SinglePostSideBar from "../SinglePost/SinglePostSideBar";
import Comments from "./Comments";

export default function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const { user } = useContext(UserContext);
  const setSharedPosts = useContext(UserContext);
  const relativeTime = moment(post.createdAt).fromNow();
  const [likes, setLikes] = useState(post.likes);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isLiked, setIsLiked] = useState(
    user ? likes.some((like) => like._id === user._id) : false
  );
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          summaryApi.post.url.replace(":id", post._id),
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setComments(response.data.comments);
      } catch (error) {
        console.error("Error fetching comments", error);
      }
    };
    fetchComments();
  }, [post._id]);

  const handleLike = async () => {
    try {
      const response = await axios.post(
        summaryApi.like.url.replace(":id", post._id),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIsLiked((prev) => !prev);
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  };

  const editPost = async () => {
    try {
      navigate(`/posts/edit/${post._id}`);
      Swal.fire({
        icon: "success",
        title: "Post is ready for editing!",
        showConfirmButton: false,
        timer: 500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong with editing!",
      });
    }
  };

  const deletePost = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(summaryApi.delete.url.replace(":id", post._id), {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          Swal.fire("Deleted!", "Your post has been deleted.", "success").then(
            () => {
              navigate(0);
            }
          );
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong with deleting!",
          });
        }
      }
    });
  };
  const handleContentToggle = () => {
    setShowFullContent(!showFullContent);
  };

  const reportPost = async () => {
    try {
      await axios.post(
        summaryApi.reportPost.url.replace(":id", post._id),
        { userId: user._id, reportedReason: "Inappropriate Content" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      Swal.fire("Reported!", "This post has been reported.", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        "Something went wrong with reporting the post.",
        "error"
      );
    }
  };

  function addNewlinesAfterEverySixWordsOrLongWords(
    text,
    maxWordLength = 10,
    longWordLimit = 50
  ) {
    const words = text.split(" ");
    const result = [];

    for (let i = 0; i < words.length; i++) {
      if (words[i].length > longWordLimit) {
        for (let j = 0; j < words[i].length; j += longWordLimit) {
          result.push(words[i].substring(j, j + longWordLimit));
        }
      } else {
        result.push(words[i]);
      }
      if ((i + 1) % 6 === 0) {
        result.push("\n");
      }
    }

    return result.join(" ");
  }

  const formattedText = addNewlinesAfterEverySixWordsOrLongWords(post.content);
  const maxLines = 3;
  const lines = formattedText.split("\n");
  const shouldShowReadMore = lines.length > maxLines;
  const displayedContent = showFullContent
    ? formattedText
    : lines.slice(0, maxLines).join("\n") + (shouldShowReadMore ? "..." : "");

  const handleShare = async () => {
    try {
      const response = await axios.post(
        summaryApi.share.url.replace(":id", post._id),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const { sharedPost } = response.data;

      Swal.fire({
        icon: "success",
        title: "Post shared successfully!",
        showConfirmButton: false,
        timer: 500,
      });
      setTimeout(() => {
        navigate(`/posts/${sharedPost._id}`);
      }, 500);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to share the post.",
      });
    }
  };

  const popUpImage = () => {
    Swal.fire({
      imageUrl: summaryApi.domain.url + "/uploads/" + post.media.photo,
      imageAlt: "Image Preview",
      width: "80%",
      heightAuto: false,
      background: "transparent",
      padding: "0",
      customClass: {
        popup: "custom-popup",
        image: "custom-image",
      },
      showCloseButton: true,
      closeButtonHtml:
        '<span style="font-size: 30px; color: white;">&times;</span>',
      showConfirmButton: false,
      backdrop: "rgba(0,0,0,0.8)",
    });
  };

  const MySwal = withReactContent(Swal);

  const handleComments = () => {
    setShowComments(!showComments);

    // Check if the dark mode class is applied to the root element (e.g., <html>)
    const isDarkMode = document.documentElement.classList.contains("dark");

    MySwal.fire({
      html: (
        <Comments
          initialLikes={post.likes}
          initialComments={comments}
          userprofile={user}
          id={post._id}
        />
      ),
      showCloseButton: true,
      showConfirmButton: false,
      width: "100%", // Adjust the width as needed
      customClass: {
        popup: "custom-popup",
      },
      background: isDarkMode ? "#1A1A1A" : "#FFFFFF", // Conditional background based on mode
      didClose: () => setShowComments(false), // Reset state on close
    });
  };

  const closeModal = () => {
    setShowComments(false);
  };
  if (post.user) {
    return (
      <div className="bg-[#FBFCFE] dark:bg-[#1D1D1D] duration-300 dark:text-white p-6 rounded-lg shadow-sm   w-full max-w-2xl mx-auto my-6 transition dark:shadow-slate-300">
        {/* Post Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.user._id}`}>
              <img
                src={
                  post ? summaryApi.domain.url + "/" + post.user.profilePic : ""
                }
                alt={`${post.user.name}'s profile`}
                className="w-12 h-12 rounded-full border border-gray-300 clickableImage"
              />
            </Link>
            <div>
              <Link to={`/profile/${post.user._id}`}>
                <h4 className="font-semibold hover:underline">
                  {post.user.name}
                </h4>
              </Link>
              <p className="text-gray-500 text-sm">
                {relativeTime} • {post.privacy}
              </p>
              {post.sharedPost && (
                <h6 className="text-gray-500 cursor-pointer hover:underline hover:text-blue-300">
                  Shared from:{" "}
                  <Link to={`/profile/${post.sharedPost.user._id}`}>
                    {" "}
                    {post.sharedPost.user.name}
                  </Link>
                </h6>
              )}
            </div>
          </div>
          <button className="relative">
            <BsThreeDots
              onClick={toggleOptions}
              className="text-gray-500 cursor-pointer clickableImage hover:text-gray-700"
            />
            {showOptions && (
              <PostOptions
                post={post}
                postId={post._id}
                editPost={user && user._id === post.user._id ? editPost : null}
                deletePost={
                  user && user._id === post.user._id ? deletePost : null
                }
                reportPost={
                  user && user._id !== post.user._id ? reportPost : null
                }
              />
            )}
          </button>
        </div>

        {/* Post Content */}
        <div>
          {post.media?.photo && (
            <img
              src={`${summaryApi.domain.url}/uploads/${post.media.photo}`}
              alt="post content"
              className="w-full h-auto rounded-xl clickableImage object-contain  mb-4 max-h-96"
              onClick={popUpImage}
            />
          )}
          {post.media?.video && (
            <video
              controls
              className="w-full h-auto rounded-lg clickableImage object-cover mb-4 max-h-96"
            >
              <source
                src={`${summaryApi.domain.url}/uploads/${post.media.video}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          )}
          <p className="text-gray-600 mb-4 leading-relaxed dark:text-bg">
            {post.content}
          </p>
          <Link
            to={`/posts/${post._id}`}
            className="text-blue-600 dark:text-primary font-semibold hover:underline"
          >
            READ MORE
          </Link>
        </div>

        {/* Post Footer */}
        <div className="flex justify-between items-center mt-4 border-t pt-4">
          <div className="flex gap-4 text-gray-600">
            <button
              className={`flex clickableImage items-center gap-1 hover:text-red-500 ${
                isLiked ? "text-red-500" : ""
              }`}
              onClick={handleLike}
            >
              <AiOutlineHeart size={22} />
              <span>{likes.length}</span>
            </button>
            <button
              className="flex clickableImage items-center gap-1 hover:text-blue-500"
              onClick={handleComments}
            >
              <AiOutlineMessage size={22} />
              <span>{post.comments.length}</span>
            </button>
          </div>
          <button
            className="flex clickableImage items-center gap-1 text-gray-600 hover:text-blue-500"
            onClick={handleShare}
          >
            <AiOutlineShareAlt size={22} />
            Share
          </button>
        </div>
      </div>
    );
  }
}
