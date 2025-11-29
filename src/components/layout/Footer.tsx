export function Footer() {
    return (
        <footer className="border-t py-6 text-center text-sm text-gray-500">
            <div className="container mx-auto px-4">
                &copy; {new Date().getFullYear()} Trip Planner. All rights reserved.
            </div>
        </footer>
    );
}
