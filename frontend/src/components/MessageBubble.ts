import { styled } from "styled-components";

export const MessageBubble = styled.div<{ $type: "sender" | "receiver" }>`
  background-color: ${({ $type }) => ($type === "sender" ? "#dcf8c6" : "#fff")};
  color: #000;
  padding: 5px 8px;
  border-radius: 11px;
  box-shadow: 1px 1px 1px 1px rgba(207, 207, 207, 0.36);
  position: relative;
  margin-top: 8px;

  &::after {
    content: "";
    position: absolute;
    ${({ $type }) => ($type === "sender" ? "right" : "left")}: -8px;
    bottom: 0;
    width: 16px;
    height: 14px;
    clip-path: path(
      "M9.84509 3.64861C13.4864 -5.25243 18.7461 5.26698 14.2956 10.3918C9.8451 15.5167 0 14.3029 0 14.3029C0 14.3029 6.20375 12.5496 9.84509 3.64861Z"
    );
    ${({ $type }) => ($type === "sender" ? "transform: scaleX(-1);" : "")}
    background-color: ${({ $type }) =>
      $type === "sender" ? "#dcf8c6" : "#fff"};
  }
`;
