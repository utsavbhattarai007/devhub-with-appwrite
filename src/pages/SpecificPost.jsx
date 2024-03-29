import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../css/pages/SpecificPost.module.css";
import { Button, IconButton, InputBase } from "@pankod/refine-mui";
import { BiArrowBack } from "react-icons/bi";
import Post from "../components/Post";
import Comment from "../components/Comment";
import { ContextProvider } from "../config/Context";
import moment from "moment";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { database } from "../appwrite/appwriteConfig";
import Avatar, { genConfig } from "react-nice-avatar";

const SpecificPost = () => {
  const { userDetails } = useContext(ContextProvider);
  const [user, setuser] = userDetails;

  const { id } = useParams();
  const [comment, setComment] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({});
  const [trigger, settrigger] = useState(false);

  const db_id = import.meta.env.VITE_DATABASE_ID;
  const devit_id = import.meta.env.VITE_DEVIT_COLLECTION_ID;

  useEffect(() => {
    fetchDevit();
  }, [trigger, id]);

  const fetchDevit = async () => {
    try {
      const res = await database.getDocument(db_id, devit_id, id);
      setData(res);
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };
  if (loading) return <Loader height="80vh" />;

  const GoBack = () => {
    window.history.back();
  };

  // create a comment
  const createComment = async () => {
    try {
      let comments = data?.comments;
      comments.push(`{
        "userid": "${user?.uid}",
        "username": "${user?.username}",
        "avatar": "${user?.avatar}",
        "comment": "${comment}",
        "time": "${moment().format("MMMM Do YYYY, h:mm:ss a")}",
        "timestamp": "${moment().unix()}",
        "verified": ${user?.verified},
        "name":"${user?.firstname} ${user?.lastname}"
      }`);
      const res = await database.updateDocument(db_id, devit_id, id, {
        comments: comments,
      });
      if (res.$id) {
        settrigger(!trigger);
        setComment("");
        toast.success("You replied to this devit");
        window.location.reload();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const config = genConfig(user?.avatar);

  return (
    <>
      <div className={styles.specificpost_container}>
        <div className={styles.header_post}>
          <IconButton
            sx={{
              width: "38px",
              height: "38px",
            }}
            onClick={GoBack}
          >
            <BiArrowBack />
          </IconButton>
          <span className={styles.heading}>Devit</span>
        </div>
        <Post data={data} />
        <div className={styles.post_comment}>
          <Avatar style={{ width: "45px", height: "45px" }} {...config} />
          <InputBase
            sx={{
              flex: 1,
              fontSize: "16px",
              fontFamily: "Poppins",
              color: "text.normal",
              // style the placeholder
              "& .MuiInputBase-input::placeholder": {
                color: "text.light",
                opacity: 1,
                fontSize: "1rem",
                // fontWeight: "500",
                fontFamily: "Poppins",
              },
            }}
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
          />

          <Button
            onClick={createComment}
            variant="contained"
            sx={{
              width: "80px",
              height: "38px",
              fontSize: "16px",
              fontWeight: "600",
              fontFamily: "Poppins",
              color: "text.normal",
              textTransform: "capitalize",
              borderRadius: "100vw",
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.main",
              },
            }}
            disabled={comment === "" ? true : false}
          >
            Reply
          </Button>
        </div>
        <Comment data={data} />
      </div>
    </>
  );
};

export default SpecificPost;
