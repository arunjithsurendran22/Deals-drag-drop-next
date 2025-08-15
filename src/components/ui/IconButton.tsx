export default function IconButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="p-1 rounded hover:bg-gray-100 focus-ring" {...rest}>
      {children}
    </button>
  );
}