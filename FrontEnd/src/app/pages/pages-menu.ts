import { NbMenuItem } from "@nebular/theme";

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: "Admin Question Management",
    icon: "lock",
    link: "/question-management",
    home: true,
  },
  {
    title: "User Question Management",
    icon: "question-mark-circle",
    link: "/user-question-management",
  },
  {
    title: "User Management",
    icon: "person",
    link: "/user-management",
  },
  {
    title: "Reported Post",
    icon: "star",
    link: "/reported-post",
  },
  {
    title: "Reported User",
    icon: "person",
    link: "/reported-user",
  },
  {
    title: "Report Reason Master",
    icon: "flag",
    link: "/report-reason-master",
  },
  {
    title: "Reported Comment",
    icon: "message-circle",
    link: "/reported-comment",
  },
  {
    title: "Accepted Reported Comment",
    icon: "checkmark-circle-2",
    link: "/accepted-reported-comment",
  },
  {
    title: "Request Management",
    icon: "layers-outline",
    link: "/request-management",
  },
];
