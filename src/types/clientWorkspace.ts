export type ClientProgressStepState = "complete" | "current" | "attention" | "upcoming";

export type ClientProgressStep = {
  id: string;
  label: string;
  description: string;
  state: ClientProgressStepState;
};

export type ClientPaymentMethod = "card" | "wallet" | "bank";

export type ClientPaymentState = "idle" | "sent" | "paid";

export type ClientPaymentOption = {
  id: ClientPaymentMethod;
  label: string;
  detail: string;
  icon: string;
};
