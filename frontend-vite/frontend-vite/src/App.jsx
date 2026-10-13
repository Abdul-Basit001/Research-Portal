
import OpportunityForm from "./components/OpportunityForm";
import "./App.css";

function App() {
    const path = window.location.pathname;

    return (
        <div className="app-shell">
            <header className="site-header">
                <a className="brand" href="/">
                    <span className="brand-mark" aria-hidden="true">R</span>
                    <span>Research Portal</span>
                </a>
                <nav aria-label="Main navigation">
                    <a className={path === "/" ? "nav-link active" : "nav-link"} href="/">
                        Home
                    </a>
                    <a
                        className={path === "/create" ? "nav-link active" : "nav-link"}
                        href="/create"
                    >
                        Create opportunity
                    </a>
                </nav>
            </header>

            {path === "/create" ? (
                <main className="page-content">
                    <a className="back-link" href="/">← Back to home</a>
                    <div className="page-heading">
                        <p className="eyebrow">OPPORTUNITIES</p>
                        <h1>Create a research opportunity</h1>
                        <p>Share a project with students and researchers at your university.</p>
                    </div>
                    <OpportunityForm />
                </main>
            ) : path === "/" ? (
                <main className="home-content">
                    <p className="eyebrow">UNIVERSITY RESEARCH</p>
                    <h1>Turn great questions into meaningful research.</h1>
                    <p className="home-description">
                        Create an opportunity and connect your research project with the people
                        ready to make a difference.
                    </p>
                    <a className="primary-link" href="/create">Create an opportunity</a>
                </main>
            ) : (
                <main className="page-content">
                    <div className="page-heading">
                        <h1>Page not found</h1>
                        <a className="back-link" href="/">Return to the home page</a>
                    </div>
                </main>
            )}
        </div>
    );
}

export default App;
