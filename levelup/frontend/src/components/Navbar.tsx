function Navbar() {
    return (
        <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <span className="text-xl font-bold">LevelUp</span>
            <a href="/admin" className="text-gray-300 hover:text-white">Admin</a>
        </nav>
    )
}

export default Navbar