import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="app-wrapper flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-7xl font-bold text-primary">404</div>
      <p className="opacity-70">This page doesn't exist in the OctaP draft.</p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
