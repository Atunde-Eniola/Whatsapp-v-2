import styled from "styled-components";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { Avatar, IconButton } from "@material-ui/core";
import { auth, db } from "../firebase";
import { MoreVertOutlined } from "@mui/icons-material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useCollection } from "react-firebase-hooks/firestore";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MicIcon from "@mui/icons-material/Mic";
import Message from "./Message";
import { useRef, useState } from "react";
import firebase from "firebase/compat/app";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";

const ChatScreen = ({ chat, messages }) => {
	const [user] = useAuthState(auth);
	const router = useRouter();
	const endOfMessagesRef = useRef(null);
	const [input, setInput] = useState("");
	const [messagesSnapshot] = useCollection(
		db
			.collection("chats")
			.doc(router.query.id)
			.collection("messages")
			.orderBy("timestamp", "asc")
	);

	const [recipientSnapshot] = useCollection(
		db
			.collection("users")
			.where("email", "==", getRecipientEmail(chat.users, user))
	);

	const showMessages = () => {
		if (messagesSnapshot) {
			return messagesSnapshot.docs.map((message) => (
				<Message
					key={message.id}
					user={message.data().user}
					message={{
						...message.data(),
						timestamp: message.data().timestamp?.toDate().getTime(),
					}}
				/>
			));
		} else {
			return JSON.parse(messages).map((message) => (
				<Message key={message.id} user={message.user} message={message} />
			));
		}
	};

	const scrollToBottom = () => {
		endOfMessagesRef.current.scrollIntoView({
			behaviour: "smooth",
			block: "start",
		});
	};

	const sendMessage = (e) => {
		e.preventDefault();

		// UPDATE LAST SEEN
		db.collection("users").doc(user.uid).set(
			{
				lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
			},
			{ merge: true }
		);
		db.collection("chats").doc(router.query.id).collection("messages").add({
			timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			message: input,
			user: user.email,
			photoURL: user.photoURL,
		});
		setInput("");
		scrollToBottom();
	};

	const recipient = recipientSnapshot?.docs?.[0]?.data();
	const recipientEmail = getRecipientEmail(chat.users, user);

	return (
		<Container>
			<Header>
				{recipient ? (
					<Avatar src={recipient?.photoURL} />
				) : (
					<Avatar>{recipientEmail[0]}</Avatar>
				)}
				<HeaderInformation>
					<h3>{recipientEmail}</h3>
					{recipientSnapshot ? (
						<p>
							Last active:{" "}
							{recipient?.lastSeen?.toDate() ? (
								<TimeAgo datetime={recipient?.lastSeen?.toDate()} />
							) : (
								"unavailable"
							)}
						</p>
					) : (
						<p>Loading last active...</p>
					)}
				</HeaderInformation>
				<HeaderIcons>
					<IconButton>
						<AttachFileIcon />
					</IconButton>
					<IconButton>
						<MoreVertOutlined />
					</IconButton>
				</HeaderIcons>
			</Header>
			<MessageContainer>
				{showMessages()}
				<EndOFMessage ref={endOfMessagesRef} />
			</MessageContainer>
			<InputContainer>
				<InsertEmoticonIcon />
				<Input value={input} onChange={(e) => setInput(e.target.value)} />
				<button hidden disabled={!input} type='submit' onClick={sendMessage}>
					Send message
				</button>
				<MicIcon />
			</InputContainer>
		</Container>
	);
};

export default ChatScreen;

const Container = styled.div``;

const Header = styled.div`
	position: sticky;
	background-color: #fff;
	z-index: 100;
	top: 0;
	padding: 11px;
	display: flex;
	align-items: center;
	height: 80px;
	border-bottom: 1px solid whitesmoke;
`;

const HeaderInformation = styled.div`
	margin-left: 15px;
	flex: 1;

	> h3 {
		margin-bottom: 3px;
	}

	> p {
		font-size: 14px;
		color: gray;
	}
`;

const HeaderIcons = styled.div``;

const MessageContainer = styled.div`
	padding: 30px;
	background-color: #e5ded8;
	min-height: 90vh;
`;

const EndOFMessage = styled.div`
	margin-bottom: 50px;
`;

const InputContainer = styled.form`
	display: flex;
	align-items: center;
	position: sticky;
	padding: 10px;
	bottom: 0;
	z-index: 100;
	background-color: white;
`;

const Input = styled.input`
	flex: 1;
	padding: 20px;
	outline: 0;
	border: none;
	border-radius: 10px;
	margin-left: 15px;
	margin-right: 15px;
	background-color: whitesmoke;
`;
