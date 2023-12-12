import { useParams } from "react-router-dom";
import { MessageBubble, InputTextAndButtons } from "../components/MessageBubble";
import useSWR from "swr";
import { Context, Message } from "../Context";
import { useContext, useState, useEffect, useRef } from "react";
import useSWRMutation from "swr/mutation";

export function Conversation() {
  const { userId } = useParams<{ userId: string }>();
  const [videoStream, setVideoStream] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const { data } = useSWR<Message[]>(`/api/conversation/${userId}`);
  const ctx = useContext(Context);

  const [inputMessage, setInputMessage] = useState("");

  if (!("user" in ctx)) {
    return;
  }

  const fileInputRef = useRef(null);

  const messages = new Map([
    ...(data ?? []).map<[string, Message]>((msg) => [msg.id, msg]),
    ...(ctx.socketMessages[userId!] ?? []).map<[string, Message]>((msg) => [
      msg.id,
      msg,
    ]),
  ]);

  //Camera
  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        setVideoStream(stream);
      })
      .catch(error => {
        console.error('Cant access the camera', error);
      });
  }

  const sendImage = async (image) => {
    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "x-user-id": ctx.user.id,
          "content-type": "application/json",
        },
        body: JSON.stringify({ content: image, receiverId: userId }),
      });

      if (response.ok) {
        // Optionally handle success
      } else {
        console.error("Failed to send image");
      }
    } catch (error) {
      console.error("Error sending image:", error);
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const onFileInputChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const base64 = await convertBase64(file);
      sendImage(base64);
    }
  };

  const takeSnapshot = () => {
    if (videoStream) {
      const cameraFeed = videoRef.current;

      const canvas = document.createElement('canvas');
      canvas.width = cameraFeed.videoWidth;
      canvas.height = cameraFeed.videoHeight;
      const snapshotCtx = canvas.getContext('2d');
      snapshotCtx.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
      setSnapshot(canvas.toDataURL('image/png'));
    }
  }

  const sendSnapshot = () => {
    fetch("/api/message", {
      method: "POST",
      headers: {
        "x-user-id": ctx.user.id,
        "content-type": "application/json",
      },
      body: JSON.stringify({ content: snapshot, receiverId: userId }),
    }).then((res) => {
      stopCamera();
      res.json();
    });

  }

  const stopCamera = () => {
    if (videoStream) {
      const tracks = videoStream.getTracks();
      tracks.forEach(track => track.stop());
      setVideoStream(null);
      setSnapshot(null);
    }
  }

  return (
    <div>
      {Array.from(messages.values()).map((message) => (
        <MessageBubble
          key={message.id}
          $type={message.senderId === ctx.user.id ? "sender" : "receiver"}
        >
          {message.content.startsWith('data:') && (
            <img src={message.content} alt="Snapshot" />
          ) || (
              <p>{message.content}</p>
            )}
        </MessageBubble>
      ))}

      <input
          type="text"
          value={inputMessage}
          onChange={(ev) => setInputMessage(ev.target.value)}
        />
        <button
          onClick={() => {
            fetch("/api/message", {
              method: "POST",
              headers: {
                "x-user-id": ctx.user.id,
                "content-type": "application/json",
              },
              body: JSON.stringify({ content: inputMessage, receiverId: userId }),
            }).then((res) => res.json());
            setInputMessage("");
          }}
        >
          Send message
        </button>

        {!videoStream && !snapshot && (
          <button onClick={startCamera}>Start Camera</button>
        )}

        {videoStream && !snapshot && (
          <div>
            <video
              ref={videoRef}
              width="640"
              height="480"
              style={{ display: videoStream ? 'block' : 'none' }}
              autoPlay
              playsInline
            ></video>
            <button onClick={takeSnapshot}>Take Snapshot</button>
            <button onClick={stopCamera}>Cancel</button>
          </div>
        )}

        {snapshot && (
          <div>
            <img src={snapshot} alt="Snapshot" />
            <button onClick={sendSnapshot}>Send</button>
            <button onClick={stopCamera}>Cancel</button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onFileInputChange}
        />
        <button onClick={handleImageUpload}>Upload Image</button>

        
      </div>

  
  );
}