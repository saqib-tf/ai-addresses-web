export default function AboutPage() {
  return (
    <div className="min-h-[80dvh] px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">About</h1>
      <p className="text-gray-600 dark:text-gray-300">This is the about page.</p>
      <p className="text-gray-600 dark:text-gray-300">Current NODE_ENV: {process.env.NODE_ENV}</p>
    </div>
  );
}
