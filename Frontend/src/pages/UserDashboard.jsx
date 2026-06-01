import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const emptyForm = {
    taskName: "",
    description: "",
    taskDate: "",
    taskTime: ""
};

const statusStyles = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    "in-progress": "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
};

const UserDashboard = () => {
    const { backendUrl, token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formError, setFormError] = useState("");
    const [pageError, setPageError] = useState("");
    const [form, setForm] = useState(emptyForm);

    const baseUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;

    const stats = useMemo(() => {
        const total = tasks.length;
        const pending = tasks.filter((task) => task.status === "pending").length;
        const completed = tasks.filter((task) => task.status === "completed").length;

        return { total, pending, completed };
    }, [tasks]);

    useEffect(() => {
        if (!token) {
            navigate("/login/user", { replace: true });
            return;
        }

        const loadTasks = async () => {
            setIsLoading(true);
            setPageError("");

            try {
                const response = await fetch(`${baseUrl}/api/tasks/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load tasks.");
                }

                setTasks(data.tasks || []);
            } catch (error) {
                setPageError(error.message || "Unable to load tasks.");
            } finally {
                setIsLoading(false);
            }
        };

        loadTasks();
    }, [baseUrl, navigate, token]);

    const handleLogout = () => {
        logout();
        navigate("/login/user", { replace: true });
    };

    const handleCreateTask = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setFormError("");
        setIsSubmitting(true);

        try {
            const response = await fetch(`${baseUrl}/api/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Unable to create task.");
            }

            setTasks((currentTasks) => [data.task, ...currentTasks]);
            setForm(emptyForm);
            setIsFormOpen(false);
        } catch (error) {
            setFormError(error.message || "Unable to create task.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTaskDateTime = (taskDate, taskTime) => {
        if (!taskDate || !taskTime) {
            return "Not scheduled";
        }

        const date = new Date(`${taskDate}T${taskTime}`);

        if (Number.isNaN(date.getTime())) {
            return `${taskDate} at ${taskTime}`;
        }

        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(date);
    };

    return (
        <div
            className="min-h-screen text-slate-900"
            style={{ background: "radial-gradient(circle at top, #dbeafe 0%, #f8fafc 48%, #e2e8f0 100%)" }}
        >
            <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-linear-to-b from-sky-100/80 to-transparent" />

            <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
                <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 ring-1 ring-sky-200">
                                Task Dashboard
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                                    Welcome back, {user?.name || "User"}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                                    Track your work, create new tasks, and keep every deadline in one clean workspace.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                            >
                                <span className="text-base leading-none">+</span>
                                Create Task
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {[
                        { label: "Total Tasks", value: stats.total, accent: "from-sky-500 to-cyan-400" },
                        { label: "Pending", value: stats.pending, accent: "from-amber-500 to-orange-400" },
                        { label: "Completed", value: stats.completed, accent: "from-emerald-500 to-teal-400" }
                    ].map((item) => (
                        <div key={item.label} className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur">
                              <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${item.accent}`} />
                            <p className="text-sm font-medium text-slate-500">{item.label}</p>
                            <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{item.value}</p>
                        </div>
                    ))}
                </section>

                {pageError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {pageError}
                    </div>
                )}

                <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <div className="border-b border-slate-200/80 px-6 py-5">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Your Tasks</h2>
                                <p className="text-sm text-slate-500">A quick view of everything you have scheduled.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(true)}
                                className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-500"
                            >
                                New Task
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="h-44 animate-pulse rounded-3xl bg-slate-100" />
                                ))}
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-2xl text-sky-700">
                                    ✓
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No tasks yet</h3>
                                <p className="mt-2 max-w-md text-sm text-slate-500">
                                    Create your first task to start organizing your day.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(true)}
                                    className="mt-6 inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Create Task
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {tasks.map((task) => (
                                    <article key={task._id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                                                    Task
                                                </p>
                                                <h3 className="mt-2 text-lg font-semibold text-slate-900">{task.taskName}</h3>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[task.status] || statusStyles.pending}`}>
                                                {task.status}
                                            </span>
                                        </div>

                                        <p className="mt-4 text-sm leading-6 text-slate-600" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {task.description}
                                        </p>

                                        <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium text-slate-500">Date</span>
                                                <span className="font-semibold text-slate-900">{task.taskDate}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium text-slate-500">Time</span>
                                                <span className="font-semibold text-slate-900">{task.taskTime}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="font-medium text-slate-500">Scheduled</span>
                                                <span className="text-right font-semibold text-slate-900">
                                                    {formatTaskDateTime(task.taskDate, task.taskTime)}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
                    <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_120px_rgba(15,23,42,0.28)]">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">Create Task</h3>
                                    <p className="text-sm text-slate-500">Add a new task with deadline details.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        setFormError("");
                                    }}
                                    className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-4 px-6 py-6">
                            <label className="block text-sm font-semibold text-slate-700">
                                Task Name
                                <input
                                    type="text"
                                    value={form.taskName}
                                    onChange={(event) => setForm((current) => ({ ...current, taskName: event.target.value }))}
                                    placeholder="Enter task name"
                                    required
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                                />
                            </label>

                            <label className="block text-sm font-semibold text-slate-700">
                                Description
                                <textarea
                                    value={form.description}
                                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                    placeholder="Describe the task"
                                    rows="4"
                                    required
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                                />
                            </label>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Set Date
                                    <input
                                        type="date"
                                        value={form.taskDate}
                                        onChange={(event) => setForm((current) => ({ ...current, taskDate: event.target.value }))}
                                        required
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                                    />
                                </label>

                                <label className="block text-sm font-semibold text-slate-700">
                                    Set Time
                                    <input
                                        type="time"
                                        value={form.taskTime}
                                        onChange={(event) => setForm((current) => ({ ...current, taskTime: event.target.value }))}
                                        required
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                                    />
                                </label>
                            </div>

                            {formError && (
                                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                                    {formError}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        setFormError("");
                                    }}
                                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? "Creating..." : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;