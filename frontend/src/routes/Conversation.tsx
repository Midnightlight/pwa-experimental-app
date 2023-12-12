import { useParams } from "react-router-dom";
import {
  MessageBubble,
  InputTextAndButtons,
} from "../components/MessageBubble";
import useSWR from "swr";
import { Context, Message } from "../Context";
import { useContext, useState, useEffect, useRef } from "react";
import useSWRMutation from "swr/mutation";
import styled from "styled-components";

const RemovePendingMediaBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  position: absolute;
  top: -8px;
  right: -8px;
  width: 26px;
  height: 26px;
  padding: 1px;
  background: white;
  border-radius: 9999px;
`;

const PendingMedia = styled.img`
  border-radius: 4px;
  width: 33vw;
  aspect-ratio: 1 / 1;
  object-fit: cover;
`;

const MessageImage = styled.img`
  width: 100%;
  object-fit: cover;
  aspect-ratio: 1 / 1;
  border-radius: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: #006ee6;
  margin-right: 12px;
  flex-shrink: 0;
`;

const MessageInput = styled.input`
  background: white;
  border-radius: 7px;
  border: 1px solid lightgray;
  flex-grow: 1;
  outline: none;
  margin-right: 12px;
  padding: 6px;
`;

const BottomBar = styled.div`
  position: absolute;
  bottom: 0;
  width: 100vw;
  background: white;
  padding: 6px;
  left: 0;
  padding-bottom: calc(env(safe-area-inset-bottom) + 6px);
`;

export function Conversation() {
  const { userId } = useParams<{ userId: string }>();
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [pendingMedia, setPendingMedia] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const { data } = useSWR<Message[]>(`/api/conversation/${userId}`);
  const ctx = useContext(Context);

  const [inputMessage, setInputMessage] = useState("");

  if (!("user" in ctx)) {
    return;
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = new Map([
    ...(data ?? []).map<[string, Message]>((msg) => [msg.id, msg]),
    ...(ctx.socketMessages[userId!] ?? []).map<[string, Message]>((msg) => [
      msg.id,
      msg,
    ]),
  ]);

  //Camera
  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        setVideoStream(stream);
      })
      .catch((error) => {
        console.error("Cant access the camera", error);
      });
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const convertBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result?.toString() ?? "");
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const onFileInputChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      const base64 = await convertBase64(file);
      console.log(base64);
      setPendingMedia(base64);
    }
  };

  const takeSnapshot = () => {
    const cameraFeed = videoRef.current;
    if (videoStream && cameraFeed) {
      const canvas = document.createElement("canvas");
      canvas.width = cameraFeed.videoWidth;
      canvas.height = cameraFeed.videoHeight;
      const snapshotCtx = canvas.getContext("2d");
      snapshotCtx!.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
      setPendingMedia(canvas.toDataURL("image/png") ?? "");
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      const tracks = videoStream.getTracks();
      tracks.forEach((track) => track.stop());
      setVideoStream(null);
      setPendingMedia(null);
    }
  };

  return (
    <div>
      <div
        style={{
          maxHeight: "calc(100vh - 50px)",
          overflow: "auto",
          paddingBottom: "6px",
        }}
      >
        {Array.from(messages.values()).map((message) => {
          const [body, img] = message.content.split("///");
          return (
            <MessageBubble
              key={message.id}
              $type={message.senderId === ctx.user.id ? "sender" : "receiver"}
            >
              {img && <MessageImage src={img} alt="Snapshot" />}
              <>{body}</>
            </MessageBubble>
          );
        })}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFileInputChange}
      />

      <BottomBar>
        {pendingMedia && (
          <div style={{ position: "relative", width: "33vw" }}>
            <PendingMedia src={pendingMedia} alt="Pending media" />
            <RemovePendingMediaBtn onClick={() => setPendingMedia(null)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ width: "24px", height: "24px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </RemovePendingMediaBtn>
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <ActionButton onClick={handleImageUpload}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: "24px", height: "24px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </ActionButton>

          <ActionButton onClick={startCamera}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: "24px", height: "24px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
          </ActionButton>

          <MessageInput
            type="text"
            value={inputMessage}
            onChange={(ev) => setInputMessage(ev.target.value)}
          />

          <ActionButton
            onClick={() => {
              fetch("/api/message", {
                method: "POST",
                headers: {
                  "x-user-id": ctx.user.id,
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  content: `${inputMessage}${
                    pendingMedia ? `///${pendingMedia}` : ""
                  }`,
                  receiverId: userId,
                }),
              }).then((res) => res.json());
              setInputMessage("");
              setPendingMedia(null);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ width: "24px", height: "24px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </ActionButton>
        </div>
      </BottomBar>

      {videoStream && !pendingMedia && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <video
            ref={videoRef}
            width="640"
            height="480"
            style={{ display: videoStream ? "block" : "none" }}
            autoPlay
            playsInline
          ></video>
          <button onClick={takeSnapshot}>Take Snapshot</button>
          <button onClick={stopCamera}>Cancel</button>
        </div>
      )}
    </div>
  );
}
