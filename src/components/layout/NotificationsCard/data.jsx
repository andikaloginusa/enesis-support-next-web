"use client";
import { ASSET_AVATARS } from "@/utils/paths";
import {
  RiCake2Fill,
  RiMessage2Line,
  RiNotificationBadgeFill,
  RiProfileLine,
  RiThumbUpFill,
} from "react-icons/ri";
export const notificationData = [
  {
    id: 432,
    firstName: "Stella",
    lastName: "Johnson",
    profilePic: `${ASSET_AVATARS}/avatar14.jpg`,
    content: "has recently posted an album",
    createdAt: "11:01 AM",
    icon: <RiThumbUpFill fontSize={16} />,
  },
  {
    id: 433,
    firstName: "Alex",
    lastName: "Brown",
    profilePic: `${ASSET_AVATARS}/garry-sobars.jpg`,
    content: `has shared Martin Guptil's post`,
    createdAt: "5:18 PM",
    icon: <RiMessage2Line fontSize={16} />,
  },
  {
    id: 434,
    firstName: "Domnic",
    lastName: "Brown",
    profilePic: `${ASSET_AVATARS}/john-smith.png`,
    content: "has sent you a group invitation for Global Health",
    createdAt: "5:36 PM",
    icon: <RiNotificationBadgeFill fontSize={16} />,
  },
  {
    id: 435,
    firstName: "John",
    lastName: "Smith",
    profilePic: `${ASSET_AVATARS}/steve-smith.jpg`,
    content: "has birthday today",
    createdAt: "5:54 PM",
    icon: <RiCake2Fill fontSize={16} />,
  },
  {
    id: 436,
    firstName: "Charis",
    lastName: "Brown",
    profilePic: `${ASSET_AVATARS}/joshua.jpg`,
    content: "has updated his profile picture",
    createdAt: "5:25 AM",
    icon: <RiProfileLine fontSize={16} />,
  },
];
