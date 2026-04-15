import { Link } from "react-router";
import { Ghost, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
            <div className="bg-emerald-100 p-6 rounded-full animate-bounce">
                <Ghost className="w-16 h-16 text-emerald-600" />
            </div>
        </div>
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-stone-900">
            404 - Page Not Found
          </h2>
          <p className="mt-4 text-center text-lg text-stone-500">
            Oops! The cattle seem to have wandered off. We can't find the page you're looking for.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <ArrowLeft className="mr-2 w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
