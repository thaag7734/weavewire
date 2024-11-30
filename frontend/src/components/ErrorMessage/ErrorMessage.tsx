import "./ErrorMessage.css";

export default function ErrorMessage({ msg }: { msg: string }) {
  return <span className="error">{msg}</span>;
}
