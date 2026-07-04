import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useLocation, useNavigate } from "react-router-dom"
import api from "../api/client"
import Navbar from "../components/Navbar"
import { useToast } from "../context/ToastContext"

interface AdminUser {
    id: string
    username: string
    email: string
    profile_picture_url?: string | null
    is_admin: boolean
    is_active: boolean
}

interface AdminStats {
    total_users: number
    total_admins: number
    total_active: number
    total_inactive: number
}

interface UserFormState {
    username: string
    email: string
    is_admin: boolean
    is_active: boolean
}

interface ActivationKeyState {
    product_id: string
    activation_code: string
}

interface ProductImageState {
    link: string
    alt: string
}

interface ProductCreateState {
    product_id: string
    steam_appid: string
    product_name: string
    description: string
    price: string
    product_thumbnail_link: string
    genres: string[]
    product_images: ProductImageState[]
}

interface AdminProduct {
    id: string
    product_id: string
    product_name: string
    description?: string
    price?: number
    stock?: number
    steam_appid?: number
    product_thumbnail_link?: string | null
    product_genres?: string[]
    product_images?: ProductImageState[]
}

const emptyUserForm: UserFormState = {
    username: "",
    email: "",
    is_admin: false,
    is_active: true,
}

const emptyActivationForm: ActivationKeyState = {
    product_id: "",
    activation_code: "",
}

const emptyProductForm: ProductCreateState = {
    product_id: "",
    steam_appid: "",
    product_name: "",
    description: "",
    price: "",
    product_thumbnail_link: "",
    genres: [],
    product_images: [],
}

const parseNumberInput = (value: string) => {
    if (!value.trim()) return ""
    const parsed = Number(value)
    return Number.isFinite(parsed) ? value : ""
}

const getErrorMessage = (error: any, fallback: string) => {
    return error?.response?.data?.description ?? 
           error?.response?.data?.error ?? 
           error?.response?.data?.message ?? 
           fallback;
}

function getAuthToken() {
    return localStorage.getItem("access_token") || localStorage.getItem("token")
}

function AdminPage() {
    const { success, error: showToastError } = useToast() as any
    const location = useLocation()
    const navigate = useNavigate()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [products, setProducts] = useState<AdminProduct[]>([])
    const [stats, setStats] = useState<AdminStats>({
        total_users: 0,
        total_admins: 0,
        total_active: 0,
        total_inactive: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [savingUserId, setSavingUserId] = useState<string | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm)
    const [activationForm, setActivationForm] = useState<ActivationKeyState>(emptyActivationForm)
    const [activationLoading, setActivationLoading] = useState(false)
    const [availableGenres, setAvailableGenres] = useState<{ id: string; name: string }[]>([])
    const [productForm, setProductForm] = useState<ProductCreateState>(emptyProductForm)
    const [steamLoading, setSteamLoading] = useState(false)
    const [productSaving, setProductSaving] = useState(false)
    const [selectedSection, setSelectedSection] = useState<"overview" | "users" | "products" | "keys">("overview")
    const [savingProductId, setSavingProductId] = useState<string | null>(null)
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
    const [usersPage, setUsersPage] = useState(1)
    const [productsPage, setProductsPage] = useState(1)
    const [userSearch, setUserSearch] = useState("")
    const [productSearch, setProductSearch] = useState("")
    const ITEMS_PER_PAGE = 10

    const token = getAuthToken()
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined

    const selectedUser = users.find((user: AdminUser) => user.id === selectedUserId) || null
    const selectedProduct = products.find((product: AdminProduct) => product.id === selectedProductId) || null

    const normalizeStats = (rawStats: Record<string, unknown>): AdminStats => ({
        total_users: Number(rawStats.total_users ?? 0),
        total_admins: Number(rawStats.total_admins ?? 0),
        total_active: Number(rawStats.total_active ?? 0),
        total_inactive: Number(rawStats.total_inactive ?? rawStats["total_inactive:"] ?? 0),
    })

    const handleSectionChange = (section: "overview" | "users" | "products" | "keys") => {
        setSelectedSection(section)
        navigate(`/admin?section=${section}`)
        setUsersPage(1)
        setProductsPage(1)
        setUserSearch("")
        setProductSearch("")
    }

    const paginatedUsers = users
        .filter((user) => {
            const query = userSearch.trim().toLowerCase()
            if (!query) return true
            return (
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            )
        })
        .slice((usersPage - 1) * ITEMS_PER_PAGE, usersPage * ITEMS_PER_PAGE)
    const totalUsersPages = Math.max(1, Math.ceil(users.filter((user) => {
        const query = userSearch.trim().toLowerCase()
        if (!query) return true
        return user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    }).length / ITEMS_PER_PAGE))

    const paginatedProducts = products
        .filter((product) => {
            const query = productSearch.trim().toLowerCase()
            if (!query) return true
            return product.product_name.toLowerCase().includes(query)
        })
        .slice((productsPage - 1) * ITEMS_PER_PAGE, productsPage * ITEMS_PER_PAGE)
    const totalProductsPages = Math.max(1, Math.ceil(products.filter((product) => {
        const query = productSearch.trim().toLowerCase()
        if (!query) return true
        return product.product_name.toLowerCase().includes(query)
    }).length / ITEMS_PER_PAGE))

    const refreshDashboard = async () => {
        const [statsResponse, usersResponse, productsResponse] = await Promise.all([
            api.get("/admin/stats", { headers: authHeaders }),
            api.get("/admin/users", { headers: authHeaders }),
            api.get("/products?limit=100", { headers: authHeaders }),
        ])

        setStats(normalizeStats(statsResponse.data || {}))
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : [])
        setProducts(Array.isArray(productsResponse.data?.products) ? productsResponse.data.products : [])
    }

    const refreshGenres = async () => {
        const { data } = await api.get("/genres", { headers: authHeaders })
        setAvailableGenres(Array.isArray(data?.genres) ? data.genres : [])
    }

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true)
            setError(null)
            const startTime = Date.now()

            try {
                await Promise.all([refreshDashboard(), refreshGenres()])
            } catch (requestError) {
                console.error("Error fetching admin dashboard:", requestError)
                setError("Unable to load the admin dashboard. Make sure you are signed in with an admin account.")
            } finally {
                const elapsed = Date.now() - startTime
                if (elapsed < 300) {
                    await new Promise((resolve) => setTimeout(resolve, 300 - elapsed))
                }
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [])

    useEffect(() => {
        if (selectedUser) {
            setUserForm({
                username: selectedUser.username,
                email: selectedUser.email,
                is_admin: selectedUser.is_admin,
                is_active: selectedUser.is_active,
            })
        } else {
            setUserForm(emptyUserForm)
        }
    }, [selectedUser])

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const section = params.get("section")
        const productId = params.get("product")

        if (section === "overview" || section === "users" || section === "products" || section === "keys") {
            setSelectedSection(section)
        }

        if (productId) {
            setSelectedProductId(productId)
            setSelectedSection("products")
        }
    }, [location.search])

    useEffect(() => {
        if (selectedProduct) {
            setProductForm({
                product_id: selectedProduct.product_id,
                steam_appid: selectedProduct.steam_appid ? String(selectedProduct.steam_appid) : "",
                product_name: selectedProduct.product_name ?? "",
                description: selectedProduct.description ?? "",
                price: selectedProduct.price !== undefined && selectedProduct.price !== null ? String(selectedProduct.price) : "",
                product_thumbnail_link: selectedProduct.product_thumbnail_link ?? "",
                genres: (selectedProduct.product_genres ?? []).map((genreId: string) => {
                    const genre = availableGenres.find((entry: { id: string; name: string }) => entry.id === genreId)
                    return genre?.name ?? genreId
                }),
                product_images: (selectedProduct.product_images ?? []).map((image: { link?: string; alt?: string }) => ({
                    link: image.link ?? "",
                    alt: image.alt ?? "",
                })),
            })
        } else {
            setProductForm(emptyProductForm)
        }
    }, [selectedProduct, availableGenres])

    useEffect(() => {
        const isModalOpen = selectedUserId !== null || selectedProductId !== null
        if (isModalOpen) {
            document.body.classList.add('admin-modal-open')
            document.documentElement.classList.add('admin-modal-open')
        } else {
            document.body.classList.remove('admin-modal-open')
            document.documentElement.classList.remove('admin-modal-open')
        }
        return () => {
            document.body.classList.remove('admin-modal-open')
            document.documentElement.classList.remove('admin-modal-open')
        }
    }, [selectedUserId, selectedProductId])

    const handleSaveUser = async () => {
        if (!selectedUserId) {
            return
        }

        if (!userForm.username.trim() || !userForm.email.trim()) {
            showToastError("Username and email are required")
            return
        }

        setSavingUserId(selectedUserId)

        try {
            await api.put(
                `/admin/users/${selectedUserId}`,
                {
                    username: userForm.username.trim(),
                    email: userForm.email.trim(),
                    is_admin: userForm.is_admin,
                    is_active: userForm.is_active,
                },
                { headers: authHeaders },
            )

            await refreshDashboard()
            setSelectedUserId(null)
        } catch (requestError) {
            console.error("Error updating user:", requestError)
            showToastError(getErrorMessage(requestError, "Unable to update the user"))
        } finally {
            setSavingUserId(null)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Delete this user permanently?")) {
            return
        }

        try {
            await api.delete(`/admin/users/${userId}`, { headers: authHeaders })
            await refreshDashboard()
            if (selectedUserId === userId) {
                setSelectedUserId(null)
            }
        } catch (requestError) {
            console.error("Error deleting user:", requestError)
            showToastError(getErrorMessage(requestError, "Unable to delete the user"))
        }
    }

    const openUserModal = (event: React.MouseEvent<HTMLButtonElement>, userId: string) => {
        const panel = document.getElementById('admin-users-panel')
        panel?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setSelectedUserId(userId)
    }

    const openProductCreateModal = () => {
        setProductCreateOpen(true)
    }

    const openProductModal = (event: React.MouseEvent<HTMLButtonElement>, productId: string) => {
        const panel = document.getElementById('admin-products-panel')
        panel?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setSelectedProductId(productId)
    }

    const closeUserModal = () => {
        setSelectedUserId(null)
    }

    const closeProductModal = () => {
        setSelectedProductId(null)
    }



    const [productCreateOpen, setProductCreateOpen] = useState(false)

    const handleSaveProduct = async () => {
        if (!selectedProductId) {
            return
        }

        if (!productForm.product_name.trim()) {
            showToastError("Product name is required")
            return
        }

        if (!productForm.price.trim()) {
            showToastError("Price is required")
            return
        }

        const priceValue = Number(productForm.price)
        if (!Number.isFinite(priceValue) || priceValue < 0) {
            showToastError("Price must be a valid positive number")
            return
        }

        const patchData: Record<string, any> = {}

        if (productForm.product_name.trim() !== (selectedProduct.product_name ?? "")) {
            patchData.product_name = productForm.product_name.trim()
        }
        if (productForm.description.trim() !== (selectedProduct.description ?? "")) {
            patchData.description = productForm.description.trim()
        }
        if (priceValue !== selectedProduct.price) {
            patchData.price = priceValue
        }

        const currentSteamAppIdStr = selectedProduct.steam_appid ? String(selectedProduct.steam_appid) : ""
        if (productForm.steam_appid.trim() !== currentSteamAppIdStr) {
            patchData.steam_appid = productForm.steam_appid.trim() ? Number(productForm.steam_appid) : null
        }

        const currentGenres = (selectedProduct.product_genres ?? []).map((genreId: string) => {
            const genre = availableGenres.find((entry: { id: string; name: string }) => entry.id === genreId)
            return genre?.name ?? genreId
        })
        const genresChanged =
            productForm.genres.length !== currentGenres.length ||
            !productForm.genres.every((g: string) => currentGenres.includes(g))

        if (genresChanged) {
            patchData.genres = productForm.genres
        }

        if (productForm.product_thumbnail_link.trim() !== (selectedProduct.product_thumbnail_link ?? "")) {
            patchData.product_thumbnail_link = productForm.product_thumbnail_link.trim()
        }

        setSavingProductId(selectedProductId)

        try {
            await api.patch(
                `/products/${selectedProductId}`,
                patchData,
                { headers: authHeaders },
            )

            await refreshDashboard()
            setSelectedProductId(null)
        } catch (requestError) {
            console.error("Error updating product:", requestError)
            showToastError(getErrorMessage(requestError, "Unable to update the product"))
        } finally {
            setSavingProductId(null)
        }
    }

    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm("Delete this game from the store?")) {
            return
        }

        try {
            console.log("Deleting product:", productId)
            await api.delete(`/products/${productId}`, { headers: authHeaders })
            await refreshDashboard()
            if (selectedProductId === productId) {
                setSelectedProductId(null)
            }
        } catch (requestError) {
            console.error("Error deleting product:", requestError)
            showToastError(getErrorMessage(requestError, "Unable to delete the product"))
        }
    }

    const handleGenerateActivationKey = async () => {
        if (!activationForm.product_id.trim()) {
            showToastError("Product ID is required")
            return
        }

        setActivationLoading(true)

        try {
            const payload = activationForm.activation_code.trim()
                ? { activation_code: activationForm.activation_code.trim() }
                : {}

            console.debug("Admin generate activation key payload", {
                product_id: activationForm.product_id.trim(),
                payload,
            })

            const response = await api.post(
                `/admin/products/${activationForm.product_id.trim()}/activation-keys`,
                payload,
                { headers: authHeaders },
            )

            console.debug("Admin generate activation key response", response.data)

            const activationItem = response.data?.activation_item
            setActivationForm(emptyActivationForm)
            success(activationItem?.activation_code
                ? `Key created: ${activationItem.activation_code}`
                : "Key created successfully")
            await refreshDashboard()
        } catch (requestError) {
            console.error("Error generating activation key:", requestError)
            showToastError(getErrorMessage(requestError, "Unable to generate the activation key"))
        } finally {
            setActivationLoading(false)
        }
    }

    const loadSteamProduct = async () => {
        const steamAppId = productForm.steam_appid.trim()
        if (!steamAppId) {
            showToastError("Steam appid is required")
            return
        }

        const steamAppIdNumber = Number(steamAppId)
        if (!Number.isInteger(steamAppIdNumber) || steamAppIdNumber < 1) {
            showToastError("Steam appid must be a valid number")
            return
        }

        setSteamLoading(true)

        try {
            const { data } = await api.get(`/products/steam-proxy/${steamAppIdNumber}`)
            const steamEntry = data?.[steamAppIdNumber]
            const steamData = steamEntry?.data

            if (!steamEntry?.success || !steamData) {
                throw new Error("Steam app not found")
            }

            const matchedGenres = (steamData.genres ?? [])
                .map((genre: { description?: string }) => genre.description)
                .filter((name: string | undefined) =>
                    Boolean(name) && availableGenres.some((genre: { id: string; name: string }) => genre.name === name)
                ) as string[]

            setProductForm((current: ProductCreateState) => ({
                ...current,
                steam_appid: steamAppId,
                product_name: steamData.name ?? current.product_name,
                description: steamData.short_description ?? current.description,
                price: steamData.price_overview?.final
                    ? String((steamData.price_overview.final / 100).toFixed(2))
                    : current.price,
                product_thumbnail_link: steamData.header_image ?? current.product_thumbnail_link,
                genres: matchedGenres.length > 0 ? matchedGenres : current.genres,
                product_images: (steamData.screenshots ?? []).slice(0, 4).map((image: { path_full?: string; path_thumbnail?: string }, index: number) => ({
                    link: image.path_full ?? image.path_thumbnail ?? "",
                    alt: `${steamData.name ?? "Game"} screenshot ${index + 1}`,
                })).filter((image: ProductImageState) => Boolean(image.link)),
            }))

            success(`Loaded ${steamData.name ?? "Steam game"} from Steam.`)
        } catch (requestError) {
            console.error("Error loading Steam product:", requestError)
            showToastError("Unable to load this Steam game. Double-check the appid.")
        } finally {
            setSteamLoading(false)
        }
    }

    const toggleGenre = (genreName: string) => {
        setProductForm((current: ProductCreateState) => ({
            ...current,
            genres: current.genres.includes(genreName)
                ? current.genres.filter((name: string) => name !== genreName)
                : [...current.genres, genreName],
        }))
    }

    const handleCreateProduct = async () => {
        if (!productForm.product_name.trim()) {
            showToastError("Product name is required")
            return
        }

        if (!productForm.steam_appid.trim()) {
            showToastError("Steam appid is required")
            return
        }

        setProductSaving(true)

        try {
            const payload = {
                product_name: productForm.product_name.trim(),
                description: productForm.description.trim(),
                price: Number(productForm.price),
                type: "key",
                steam_appid: Number(productForm.steam_appid),
                genres: productForm.genres,
                product_thumbnail_link: productForm.product_thumbnail_link.trim(),
                product_images: productForm.product_images,
            }

            if (!productForm.price.trim()) {
                showToastError("Price is required")
                return
            }

            if (!Number.isFinite(Number(productForm.price)) || Number(productForm.price) <= 0) {
                showToastError("Price must be a valid positive number greater than 0")
                return
            }

            await api.post("/products", payload, { headers: authHeaders })

            setProductForm(emptyProductForm)
            setProductCreateOpen(false)
            success(`${payload.product_name} was added to the store.`)
            await refreshDashboard()
        } catch (requestError) {
            console.error("Error creating product:", requestError)
            showToastError(getErrorMessage(requestError, "Unable to create the product"))
        } finally {
            setProductSaving(false)
        }
    }

    return (
        <div className="page admin-page">
                <section className="admin-hero">
                    <div className="container admin-hero-inner">
                        <div>
                            <span className="hero-eyebrow">Admin control room</span>
                            <h1 className="page-title"><span>Admin</span> Panel</h1>
                            <p className="section-subtitle admin-hero-subtitle">
                                Manage users, games, and activation keys from one dashboard.
                            </p>
                        </div>
                        <button
                            onClick={() => refreshDashboard().catch((requestError) => {
                                console.error("Error refreshing dashboard:", requestError)
                                showToastError(getErrorMessage(requestError, "Unable to refresh the dashboard"))
                            })}
                            className="btn btn-secondary btn-sm"
                        >
                            Refresh
                        </button>
                    </div>
                </section>

                <section className="section admin-section">
                    <div className="container">
                        {error && <div className="alert alert-error admin-alert">{error}</div>}

                        <div className="admin-shell">
                            <aside className="admin-shell-nav">
                                <button className={`admin-nav-item ${selectedSection === "overview" ? "active" : ""}`} onClick={() => handleSectionChange("overview")}>Overview</button>
                                <button className={`admin-nav-item ${selectedSection === "users" ? "active" : ""}`} onClick={() => handleSectionChange("users")}>Users</button>
                                <button className={`admin-nav-item ${selectedSection === "products" ? "active" : ""}`} onClick={() => handleSectionChange("products")}>Games</button>
                                <button className={`admin-nav-item ${selectedSection === "keys" ? "active" : ""}`} onClick={() => handleSectionChange("keys")}>Keys</button>
                            </aside>

                            <div className="admin-shell-content">
                                    {(selectedSection === "overview" || selectedSection === "users") && (
                                        <div className="admin-stats-grid">
                                            <article className="admin-stat-card">
                                                <span className="admin-stat-label">Total users</span>
                                                <strong className={`admin-stat-value ${!loading ? "animate-fade-in" : ""}`}>
                                                    {loading ? <span className="skeleton-pulse" style={{ width: '40px', height: '24px', display: 'inline-block', borderRadius: '4px' }} /> : stats.total_users}
                                                </strong>
                                            </article>
                                            <article className="admin-stat-card">
                                                <span className="admin-stat-label">Admins</span>
                                                <strong className={`admin-stat-value ${!loading ? "animate-fade-in" : ""}`}>
                                                    {loading ? <span className="skeleton-pulse" style={{ width: '40px', height: '24px', display: 'inline-block', borderRadius: '4px' }} /> : stats.total_admins}
                                                </strong>
                                            </article>
                                            <article className="admin-stat-card">
                                                <span className="admin-stat-label">Active</span>
                                                <strong className={`admin-stat-value ${!loading ? "animate-fade-in" : ""}`}>
                                                    {loading ? <span className="skeleton-pulse" style={{ width: '40px', height: '24px', display: 'inline-block', borderRadius: '4px' }} /> : stats.total_active}
                                                </strong>
                                            </article>
                                            <article className="admin-stat-card">
                                                <span className="admin-stat-label">Inactive</span>
                                                <strong className={`admin-stat-value ${!loading ? "animate-fade-in" : ""}`}>
                                                    {loading ? <span className="skeleton-pulse" style={{ width: '40px', height: '24px', display: 'inline-block', borderRadius: '4px' }} /> : stats.total_inactive}
                                                </strong>
                                            </article>
                                        </div>
                                    )}

                                    {selectedSection === "users" && (
                                        <>
                                            <section id="admin-users-panel" className="admin-panel admin-table-panel">
                                                <div className="admin-panel-header">
                                                    <div>
                                                        <h2 className="section-title">Users</h2>
                                                        <p className="section-subtitle">Editable table powered by the admin endpoints</p>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name or email..."
                                                        value={userSearch}
                                                        onChange={(event) => {
                                                            setUserSearch(event.target.value)
                                                            setUsersPage(1)
                                                        }}
                                                        className="form-input admin-search-input"
                                                    />
                                                    <span className="admin-panel-count">
                                                        {users.length > 0
                                                            ? `${(usersPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(usersPage * ITEMS_PER_PAGE, users.length)} of ${users.length}`
                                                            : `${users.length} rows`}
                                                    </span>
                                                </div>

                                                <div className="admin-table-wrap">
                                                    <table className="admin-table">
                                                        <thead>
                                                            <tr>
                                                                <th>User</th>
                                                                <th>Email</th>
                                                                <th>Role</th>
                                                                <th>Status</th>
                                                                <th className="align-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className={!loading ? "animate-fade-in" : ""}>
                                                            {loading ? (
                                                                Array.from({ length: 5 }).map((_, i) => (
                                                                    <tr key={i}>
                                                                        <td>
                                                                            <div className="skeleton-pulse" style={{ width: '80px', height: '14px', borderRadius: '4px', marginBottom: '6px' }} />
                                                                            <div className="skeleton-pulse" style={{ width: '120px', height: '12px', borderRadius: '4px' }} />
                                                                        </td>
                                                                        <td><span className="skeleton-pulse" style={{ width: '120px', height: '14px', display: 'inline-block', borderRadius: '4px' }} /></td>
                                                                        <td><span className="skeleton-pulse" style={{ width: '50px', height: '18px', display: 'inline-block', borderRadius: '4px' }} /></td>
                                                                        <td><span className="skeleton-pulse" style={{ width: '50px', height: '18px', display: 'inline-block', borderRadius: '4px' }} /></td>
                                                                        <td>
                                                                            <div className="admin-actions align-right">
                                                                                <span className="skeleton-pulse" style={{ width: '100px', height: '30px', display: 'inline-block', borderRadius: '6px' }} />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                paginatedUsers.map((user) => (
                                                                    <tr key={user.id}>
                                                                        <td>
                                                                            <div className="admin-user-main">{user.username}</div>
                                                                            <div className="admin-user-id">{user.id}</div>
                                                                        </td>
                                                                        <td>{user.email}</td>
                                                                        <td>
                                                                            <span className={`admin-badge ${user.is_admin ? 'admin-badge-admin' : 'admin-badge-user'}`}>
                                                                                {user.is_admin ? 'Admin' : 'User'}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <span className={`admin-badge ${user.is_active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                                                                                {user.is_active ? 'Active' : 'Inactive'}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <div className="admin-actions align-right">
                                                                                 <button
                                                                                     onClick={(event) => openUserModal(event, user.id)}
                                                                                     className="btn btn-secondary btn-sm"
                                                                                 >
                                                                                    Edit
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                                    className="btn btn-danger btn-sm"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {totalUsersPages > 1 && (
                                                    <div className="admin-pagination">
                                                        <span className="admin-pagination-info">
                                                            Page {usersPage} / {totalUsersPages}
                                                        </span>
                                                        <div className="admin-pagination-buttons">
                                                            <button
                                                                className="admin-pagination-btn"
                                                                disabled={usersPage <= 1}
                                                                onClick={() => setUsersPage(usersPage - 1)}
                                                            >
                                                                Prev
                                                            </button>
                                                            {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map((page) => (
                                                                <button
                                                                    key={page}
                                                                    className={`admin-pagination-btn ${usersPage === page ? "active" : ""}`}
                                                                    onClick={() => setUsersPage(page)}
                                                                >
                                                                    {page}
                                                                </button>
                                                            ))}
                                                            <button
                                                                className="admin-pagination-btn"
                                                                disabled={usersPage >= totalUsersPages}
                                                                onClick={() => setUsersPage(usersPage + 1)}
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </section>

                                            {selectedUser && (
                                                <div className="admin-modal-overlay" onClick={closeUserModal}>
                                                    <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                                                        <div className="admin-modal-header">
                                                            <h3 className="admin-modal-title">Edit user</h3>
                                                            <button className="admin-modal-close" onClick={closeUserModal}>✕</button>
                                                        </div>
                                                        <div className="admin-form-grid">
                                                            <div className="form-group">
                                                                <label className="form-label">Username</label>
                                                                <input
                                                                    type="text"
                                                                    value={userForm.username}
                                                                    onChange={(event) => setUserForm({ ...userForm, username: event.target.value })}
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="form-label">Email</label>
                                                                <input
                                                                    type="email"
                                                                    value={userForm.email}
                                                                    onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                            <div className="admin-toggle-row">
                                                                <label className="admin-toggle">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={userForm.is_admin}
                                                                        onChange={(event) => setUserForm({ ...userForm, is_admin: event.target.checked })}
                                                                    />
                                                                    <span>Admin</span>
                                                                </label>
                                                                <label className="admin-toggle">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={userForm.is_active}
                                                                        onChange={(event) => setUserForm({ ...userForm, is_active: event.target.checked })}
                                                                    />
                                                                    <span>Active</span>
                                                                </label>
                                                            </div>
                                                            <div className="admin-modal-actions">
                                                                <button
                                                                    onClick={handleSaveUser}
                                                                    disabled={savingUserId === selectedUser.id}
                                                                    className="btn btn-primary btn-sm"
                                                                >
                                                                    {savingUserId === selectedUser.id ? 'Saving...' : 'Save'}
                                                                </button>
                                                                <button
                                                                    onClick={closeUserModal}
                                                                    className="btn btn-secondary btn-sm"
                                                                >
                                                                    Close
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {selectedSection === "products" && (
                                        <>
                                            <div id="admin-products-panel" className="admin-panel admin-table-panel">
                                                <div className="admin-panel-header">
                                                    <div>
                                                        <h2 className="section-title">Games</h2>
                                                        <p className="section-subtitle">Edit or delete products from the store</p>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Search by game name..."
                                                        value={productSearch}
                                                        onChange={(event) => {
                                                            setProductSearch(event.target.value)
                                                            setProductsPage(1)
                                                        }}
                                                        className="form-input admin-search-input"
                                                    />
                                                    <span className="admin-panel-count">
                                                        {products.length > 0
                                                            ? `${(productsPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(productsPage * ITEMS_PER_PAGE, products.length)} of ${products.length}`
                                                            : `${products.length} rows`}
                                                    </span>
                                                    <button className="btn btn-primary btn-sm" onClick={openProductCreateModal}>
                                                        Add game
                                                    </button>
                                                </div>

                                                <div className="admin-table-wrap">
                                                    <table className="admin-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Game</th>
                                                                <th>Price</th>
                                                                <th>Stock</th>
                                                                <th>Status</th>
                                                                <th className="align-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className={!loading ? "animate-fade-in" : ""}>
                                                            {loading ? (
                                                                Array.from({ length: 5 }).map((_, i) => (
                                                                    <tr key={i}>
                                                                        <td>
                                                                            <div className="skeleton-pulse" style={{ width: '120px', height: '14px', display: 'block', borderRadius: '4px', marginBottom: '6px' }} />
                                                                            <div className="skeleton-pulse" style={{ width: '80px', height: '12px', display: 'block', borderRadius: '4px' }} />
                                                                        </td>
                                                                        <td><span className="skeleton-pulse" style={{ width: '50px', height: '14px', display: 'inline-block', borderRadius: '4px' }} /></td>
                                                                        <td><span className="skeleton-pulse" style={{ width: '30px', height: '14px', display: 'inline-block', borderRadius: '4px' }} /></td>
                                                                        <td><span className="skeleton-pulse" style={{ width: '70px', height: '18px', display: 'inline-block', borderRadius: '4px' }} /></td>
                                                                        <td>
                                                                            <div className="admin-actions align-right">
                                                                                <span className="skeleton-pulse" style={{ width: '100px', height: '30px', display: 'inline-block', borderRadius: '6px' }} />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                paginatedProducts.map((product) => (
                                                                    <tr key={product.product_id}>
                                                                        <td>
                                                                            <div className="admin-user-main">{product.product_name}</div>
                                                                            <div className="admin-user-id">{product.product_id}</div>
                                                                        </td>
                                                                        <td>€{Number(product.price ?? 0).toFixed(2)}</td>
                                                                        <td>{product.stock ?? 0}</td>
                                                                        <td>
                                                                            <span className={`admin-badge ${product.stock > 0 ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                                                                                {product.stock > 0 ? 'Available' : 'Out of stock'}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <div className="admin-actions align-right">
                                                                                <button onClick={(event) => openProductModal(event, product.product_id)} className="btn btn-secondary btn-sm">Edit</button>
                                                                                <button onClick={() => handleDeleteProduct(product.product_id)} className="btn btn-danger btn-sm">Delete</button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {totalProductsPages > 1 && (
                                                    <div className="admin-pagination">
                                                        <span className="admin-pagination-info">
                                                            Page {productsPage} / {totalProductsPages}
                                                        </span>
                                                        <div className="admin-pagination-buttons">
                                                            <button
                                                                className="admin-pagination-btn"
                                                                disabled={productsPage <= 1}
                                                                onClick={() => setProductsPage(productsPage - 1)}
                                                            >
                                                                Prev
                                                            </button>
                                                            {Array.from({ length: totalProductsPages }, (_, i) => i + 1).map((page) => (
                                                                <button
                                                                    key={page}
                                                                    className={`admin-pagination-btn ${productsPage === page ? "active" : ""}`}
                                                                    onClick={() => setProductsPage(page)}
                                                                >
                                                                    {page}
                                                                </button>
                                                            ))}
                                                            <button
                                                                className="admin-pagination-btn"
                                                                disabled={productsPage >= totalProductsPages}
                                                                onClick={() => setProductsPage(productsPage + 1)}
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        {productCreateOpen && (
                                            <div className="admin-modal-overlay" onClick={() => setProductCreateOpen(false)}>
                                                <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                                                    <div className="admin-modal-header">
                                                        <h3 className="admin-modal-title">Add game</h3>
                                                        <button className="admin-modal-close" onClick={() => setProductCreateOpen(false)}>✕</button>
                                                    </div>
                                                    <div className="admin-form-grid">
                                                        <div className="form-group">
                                                            <label className="form-label">Steam appid</label>
                                                            <div className="admin-inline-field">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    step="1"
                                                                    value={productForm.steam_appid}
                                                                    onChange={(event) => setProductForm({ ...productForm, steam_appid: event.target.value })}
                                                                    className="form-input"
                                                                    placeholder="e.g. 292030"
                                                                />
                                                                <button
                                                                    onClick={loadSteamProduct}
                                                                    disabled={steamLoading}
                                                                    className="btn btn-secondary btn-sm"
                                                                >
                                                                    {steamLoading ? "Loading..." : "Load from Steam"}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">Product name</label>
                                                            <input
                                                                type="text"
                                                                value={productForm.product_name}
                                                                onChange={(event) => setProductForm({ ...productForm, product_name: event.target.value })}
                                                                className="form-input"
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">Description</label>
                                                            <textarea
                                                                value={productForm.description}
                                                                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                                                                className="form-input admin-textarea"
                                                                rows={5}
                                                            />
                                                        </div>

                                                        <div className="admin-double-grid">
                                                            <div className="form-group">
                                                                <label className="form-label">Price</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={productForm.price}
                                                                    onChange={(event) => setProductForm({ ...productForm, price: parseNumberInput(event.target.value) })}
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="form-label">Thumbnail link</label>
                                                                <input
                                                                    type="text"
                                                                    value={productForm.product_thumbnail_link}
                                                                    onChange={(event) => setProductForm({ ...productForm, product_thumbnail_link: event.target.value })}
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <label className="form-label">Genres</label>
                                                            <div className="admin-genre-grid">
                                                                {availableGenres.map((genre) => (
                                                                    <button
                                                                        key={genre.id}
                                                                        type="button"
                                                                        className={`admin-genre-pill ${productForm.genres.includes(genre.name) ? 'active' : ''}`}
                                                                        onClick={() => toggleGenre(genre.name)}
                                                                    >
                                                                        {genre.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="admin-helper-box">
                                                            <strong>Images loaded:</strong> {productForm.product_images.length}
                                                        </div>

                                                        {productForm.product_images.length > 0 && (
                                                            <div className="admin-preview-grid">
                                                                {productForm.product_images.slice(0, 4).map((image) => (
                                                                    <div key={`${image.link}-${image.alt}`} className="admin-preview-card">
                                                                        <img src={image.link} alt={image.alt} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={handleCreateProduct}
                                                            disabled={productSaving}
                                                            className="btn btn-primary"
                                                        >
                                                            {productSaving ? "Creating..." : "Create product"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        {selectedProduct && (
                                            <div className="admin-modal-overlay" onClick={closeProductModal}>
                                                <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                                                    <div className="admin-modal-header">
                                                        <h3 className="admin-modal-title">Edit game</h3>
                                                        <button className="admin-modal-close" onClick={closeProductModal}>✕</button>
                                                    </div>
                                                    <div className="admin-form-grid">
                                                        <div className="form-group">
                                                            <label className="form-label">Game name</label>
                                                            <input
                                                                type="text"
                                                                value={productForm.product_name}
                                                                onChange={(event) => setProductForm({ ...productForm, product_name: event.target.value })}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div className="admin-double-grid">
                                                            <div className="form-group">
                                                                <label className="form-label">Price</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={productForm.price}
                                                                    onChange={(event) => setProductForm({ ...productForm, price: parseNumberInput(event.target.value) })}
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label className="form-label">Steam appid</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    step="1"
                                                                    value={productForm.steam_appid}
                                                                    onChange={(event) => setProductForm({ ...productForm, steam_appid: event.target.value })}
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label className="form-label">Description</label>
                                                            <textarea
                                                                value={productForm.description}
                                                                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                                                                className="form-input admin-textarea"
                                                                rows={5}
                                                            />
                                                        </div>
                                                        <div className="admin-modal-actions">
                                                            <button
                                                                onClick={handleSaveProduct}
                                                                disabled={savingProductId === selectedProduct.id}
                                                                className="btn btn-primary btn-sm"
                                                            >
                                                                {savingProductId === selectedProduct.id ? 'Saving...' : 'Save game'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProduct(selectedProduct.id)}
                                                                className="btn btn-danger btn-sm"
                                                            >
                                                                Delete game
                                                            </button>
                                                            <button
                                                                onClick={closeProductModal}
                                                                className="btn btn-secondary btn-sm"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                    )}

                                    {selectedSection === "keys" && (
                                        <section className="admin-panel admin-form-panel">
                                            <div className="admin-panel-header">
                                                <div>
                                                    <h2 className="section-title">Activation key</h2>
                                                    <p className="section-subtitle">Generate a new activation key for a game</p>
                                                </div>
                                            </div>

                                            <div className="admin-form-grid">
                                                <div className="form-group">
                                                    <label className="form-label">product_id</label>
                                                    <input
                                                        type="text"
                                                        value={activationForm.product_id}
                                                        onChange={(event) => setActivationForm({ ...activationForm, product_id: event.target.value })}
                                                        placeholder="Product UUID"
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Optional activation_code</label>
                                                    <input
                                                        type="text"
                                                        value={activationForm.activation_code}
                                                        onChange={(event) => setActivationForm({ ...activationForm, activation_code: event.target.value })}
                                                        placeholder="Leave empty to generate automatically"
                                                        className="form-input"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleGenerateActivationKey}
                                                    disabled={activationLoading}
                                                    className="btn btn-primary"
                                                >
                                                    {activationLoading ? 'Generating...' : 'Generate key'}
                                                </button>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                    </div>
                </section>

            </div>

        )
    }

export default AdminPage
